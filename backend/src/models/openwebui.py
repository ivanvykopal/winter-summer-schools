from typing import List, Union
import os
import requests
import re
import json
from tqdm import tqdm

class OpenWebUIModel():
    """
    A model class for OpenWebUI that inherits from the base Model class.
    
    Args:
        name (str): The name of the model.
        max_tokens (int): The maximum number of new tokens.
    """
    
    def __init__(self, name: str, max_tokens: int = 512, **kwargs):
        self.max_tokens = max_tokens
        self.name = name
        self.system_prompt = kwargs.get("system_prompt", None)
        self.url = os.getenv("OPENWEBUI_API_URL", "http://localhost:8000/api/chat")
        token = os.getenv("OPENWEBUI_API_KEY", "your_api_key_here")
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
    def set_system_prompt(self, system_prompt: str) -> None:
        self.system_prompt = system_prompt
        
    def save_logs(self, logs: List[dict]) -> None:
        """
        Save logs to a specified path.
        
        Args:
            logs (List[dict]): The logs to save.
            path (str): The file path where logs will be saved.
        """
        path = './cache/logs/openwebui_logs.txt'
        # append the logs to the file
        with open(path, 'a', encoding='utf-8') as file:
            for log in logs:
                file.write(json.dumps(log, ensure_ascii=False) + '\n')
    
    def generate(self, prompt: Union[str, List[str]], max_tokens: int = None, **kwargs) -> Union[str, List[str]]:
        
        is_list = isinstance(prompt, list)
        if not is_list:
            prompt = [prompt]
        
        answers = []
        for p in prompt:
            max_retries = 3
            retry_count = 0
            messages = []
            if self.system_prompt:
                messages.append({
                    "role": "system",
                    "content": self.system_prompt
                })
            messages.append({
                "role": "user",
                "content": p
            })
            
            data = {
                "model": self.name,
                "messages": messages,
                "temperature": kwargs.get("temperature", 0.0),
            }
            
            while retry_count < max_retries:
                try:
                    response = requests.post(self.url, headers=self.headers, json=data)
                    response.raise_for_status()
                    output = response.json()
                    answer = output.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if 'deepseek' in self.name.lower():
                        pattern = r"<think>.*?</think>"
                        answer = re.sub(pattern, "", answer, flags=re.DOTALL)

                    # self.save_logs([{"prompt": p, "response": answer}])
                    answers.append(answer.strip())
                    break
                except Exception as e:
                    retry_count += 1
                    if retry_count == max_retries:
                        print(f"Failed to generate response after {max_retries} attempts: {e}")
                        answers.append("Error generating response")
                        # self.save_logs([{"prompt": p, "response": "Error generating response"}])
                        
        if not is_list:
            answers = answers[0]
        
        return answers
    
    def generate_batched(self, prompts, **kwargs):
        return [
            self.generate(prompt, **kwargs) for prompt in tqdm(prompts, desc="Generating responses")
        ]
    