from src.links import LINKS
from src.models.openwebui import OpenWebUIModel
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from tqdm import tqdm
import os
import re
import datetime as dt


INSTRUCTION = '''
You are an information‑extraction assistant. From the text that follows, locate the **summer or winter school** that is being described and extract the following pieces of information.

All fields **must** be present in the JSON output; if a value cannot be found, set it to `null`.

Fields
------
* **venue** – full name of institution, city and country (e.g. "University of Zurich, Zurich, Switzerland").
* **start_date** – first day of the school, ISO‑8601 `YYYY‑MM‑DD`.
* **end_date** – last day of the school, ISO‑8601 `YYYY‑MM‑DD`.
* **application_deadline** – final day to submit an application, ISO‑8601 `YYYY‑MM‑DD`.
* **registration_status** – `"open"` if the programme is currently accepting applications, `"closed"` if it is not, `null` when the status cannot be inferred.
  * If the deadline is present, compare it with the date supplied as **Today** (see below) to decide `"open"` / `"closed"`.
  * If the text explicitly says “applications are open”, “registration closed”, etc., honour that wording even if the deadline is missing.
* **description** – a **three‑sentence** summary that captures the main focus of the school (topics, target audience, special features, etc.).  
  If the source does not contain enough material for three sentences, write as many complete sentences as you can (minimum 1) and fill the rest with `null` values so that the final JSON always contains exactly three items in an array.

Output format
-------------
Return **exactly one JSON object**, **no extra text or markdown fences**.

JSON schema (the model must follow this shape)

{{
    "venue": string | null,
    "start_date": string | null,               # ISO‑8601 YYYY‑MM‑DD
    "end_date": string | null,                 # ISO‑8601 YYYY‑MM‑DD
    "application_deadline": string | null,    # ISO‑8601 YYYY‑MM‑DD
    "registration_status": "open" | "closed" | null,
    "description": [
        string | null,
        string | null,
        string | null
    ]
}}

**Example**

Content:

The 2024 Winter School on Data Science will be held at the University of Zurich, Zurich, Switzerland from 12‑15 February 2024. Applications are open until 31 January 2024. The school focuses on machine‑learning methods for health‑care data, hands‑on projects with real clinical datasets, and networking with industry partners.

Assume today is **2024‑01‑20**.

Answer:

{{
    "venue": "University of Zurich, Zurich, Switzerland",
    "start_date": "2024-02-12",
    "end_date": "2024-02-15",
    "application_deadline": "2024-01-31",
    "registration_status": "open",
    "description": [
        "The 2024 Winter School on Data Science takes place at the University of Zurich.",
        "It concentrates on machine‑learning methods for health‑care data, hands‑on projects with real clinical datasets, and networking with industry partners.",
        "Participants will gain practical experience and make connections for future collaborations."
    ]
}}

**Now process the content below. Use the date supplied as “Today” to decide the registration status.**

Today: {today}
Content:
{content}
Answer:
'''.strip()


_month_pat = r'January|February|March|April|May|June|July|August|September|October|November|December'

_DATE_REGEXES = [
    # “July 1, 2024”
    re.compile(rf'(?P<month>{_month_pat})\s+(?P<day>\d{{1,2}}),\s+(?P<year>\d{{4}})', re.I),
    # “12/02/2024”  or  “12-02-2024”
    re.compile(r'(?P<day>\d{1,2})[\/\-](?P<month>\d{1,2})[\/\-](?P<year>\d{2,4})'),
    # “2024-02-12”
    re.compile(r'(?P<year>\d{4})[\/\-](?P<month>\d{1,2})[\/\-](?P<day>\d{1,2})')
]


def extract_information(content: str) -> dict:
    today_iso = dt.date.today().isoformat()
    prompt = INSTRUCTION.format(content=content, today=today_iso)
    model = OpenWebUIModel(name="gpt-oss-120b", max_tokens=1024)
    output = model.generate(prompt, max_tokens=512)
    return output


def extract_json(text: str) -> dict:
    # json_pattern = re.compile(r'\{(?:[^{}]|(?R))*\}', re.DOTALL)
    #\{[^{}]*\}
    json_pattern = re.compile(r'\{[^{}]*\}', re.DOTALL)
    match = json_pattern.search(text)
    if match:
        import json
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {}
    return {}


def _iso_from_text(txt: str) -> str | None:
    """
    Very small parser that turns a free‑form date string into ISO‑8601.
    Returns None if no pattern matches.
    """
    for pat in _DATE_REGEXES:
        m = pat.search(txt)
        if not m:
            continue
        try:
            d = int(m.group('day'))
            mth = int(m.group('month'))
            y = int(m.group('year'))
            # two‑digit years → assume 2000‑2099
            if y < 100:
                y += 2000
            dt_obj = dt.date(y, mth, d)
            return dt_obj.isoformat()
        except Exception:
            continue
    return None


def normalise_extracted(info: dict) -> dict:
    schema_keys = [
        "venue",
        "start_date",
        "end_date",
        "application_deadline",
        "registration_status",
        "description"
    ]
    for k in schema_keys:
        info.setdefault(k, None)


    for dk in ("start_date", "end_date", "application_deadline"):
        val = info.get(dk)
        if val and not re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(val)):
            iso = _iso_from_text(str(val))
            info[dk] = iso if iso else None


    desc = info.get("description")
    if not isinstance(desc, list):
        desc = [desc] if desc is not None else []
    desc = (desc + [None, None, None])[:3]
    info["description"] = desc

    return info


if __name__ == "__main__":
    model = OpenWebUIModel(name="gpt-oss-120b", max_tokens=1024)
    REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    path = os.path.join(REPO_ROOT, "frontend", "api", "data", "extracted_information.csv")
    
    try:
        df = pd.read_csv(path)
        df_dict = df.set_index("link").to_dict(orient="index")
        print(f"Loaded existing data with {len(df)} entries.")
    except FileNotFoundError:
        df = pd.DataFrame(columns=["name", "link", "venue", "start_date", "end_date", "application_deadline", "registration_status"])
        df_dict = {}
    
    
    for link_item in tqdm(LINKS):
        link = link_item["link"]
        name = link_item.get("name", "")
        
        try:
            response = requests.get(link, timeout=20)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Error retrieving {link}: {e}")
            continue
        
        soup = BeautifulSoup(response.text, 'html.parser')
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        
        raw_text = soup.get_text(separator="\n")
        cleaned_text = " ".join(raw_text.split())
    
        raw_llm_output = extract_information(cleaned_text)
        extracted = extract_json(raw_llm_output)
        final_info = normalise_extracted(extracted)
        
        df_dict[link] = {
            "name": name,
            "link": link,
            "venue": final_info["venue"],
            "start_date": final_info["start_date"],
            "end_date": final_info["end_date"],
            "application_deadline": final_info["application_deadline"],
            "registration_status": final_info["registration_status"],
            "description": " ".join(
                [s for s in final_info["description"] if s]  # join the non‑null sentences
            )
        }
        
        pd.DataFrame.from_dict(df_dict, orient="index").to_csv(path, index=False)
        time.sleep(5)
        
    df = pd.DataFrame.from_dict(df_dict, orient="index")
    df.to_csv(path, index=False)
