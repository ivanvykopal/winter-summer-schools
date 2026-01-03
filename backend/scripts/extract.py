from src.links import LINKS
from src.models.openwebui import OpenWebUIModel
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from tqdm import tqdm

INSTRUCTION = '''
Extract the venue and the date where the summer or winter school is held from the following content. In addition, if there is deadline information for applications, please extract that as well. Use JSON format as shown in the example.

Example:
{{
    "venue": "City University of London, London, UK",
    "date": "July 15-19, 2024",
    "application_deadline": "May 31, 2024"
}}

{content}

Answer:
'''.strip()

def extract_information(content: str) -> dict:
    prompt = INSTRUCTION.format(content=content)
    model = OpenWebUIModel(name="gpt-oss-120b", max_tokens=1024)
    output = model.generate(prompt, max_tokens=512)
    return output


def extract_json(text: str) -> dict:
    # text can contain exact JSON or text surrounding JSON
    import re
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


if __name__ == "__main__":
    model = OpenWebUIModel(name="gpt-oss-120b", max_tokens=1024)
    path = '../frontend/api/data/extracted_information.csv'
    
    try:
        df = pd.read_csv(path)
        df_dict = df.set_index("link").to_dict(orient="index")
        print(f"Loaded existing data with {len(df)} entries.")
    except FileNotFoundError:
        df = pd.DataFrame(columns=["name", "link", "venue", "date", "application_deadline"])
        df_dict = {}
    
    
    for link_item in tqdm(LINKS):
        link = link_item["link"]
        
        try:
            response = requests.get(link)
        except requests.RequestException as e:
            print(f"Error retrieving {link}: {e}")
            continue
        if response.status_code != 200:
            print(f"Failed to retrieve {link}: Status code {response.status_code}")
            continue
        
        html_content = response.text
        
        soup = BeautifulSoup(html_content, 'html.parser')
        text_content = soup.get_text(separator='\n')
        text_content = ' '.join(text_content.split())
        
        information = extract_information(text_content)     
        print(f"Extracted information for {link}:\n{information}\n")   
        info_json = extract_json(information)
        print(f"Parsed JSON for {link}:\n{info_json}\n")
        venue = info_json.get("venue", "")
        date = info_json.get("date", "")
        application_deadline = info_json.get("application_deadline", "N/A")
        
        df_dict[link] = {
            "name": link_item["name"],
            "link": link,
            "venue": venue,
            "date": date,
            "application_deadline": application_deadline
        }
        time.sleep(5)
        # iteratively save to CSV
        pd.DataFrame.from_dict(df_dict, orient="index").to_csv(path, index=False)
        
    df = pd.DataFrame.from_dict(df_dict, orient="index")
    df.to_csv(path, index=False)
