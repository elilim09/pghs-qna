from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import Optional

# .env 파일 로드
load_dotenv()

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# ✅ Firebase Hosting + 로컬 React 접근 허용
origins = [
    "https://pangyo-qna.web.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 보안을 위해 나중에 특정 도메인으로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_cpu_temp():
    try:
        result = subprocess.run(['vcgencmd', 'measure_temp'], capture_output=True, text=True)
        output = result.stdout.strip()  # 예: "temp=46.2'C"
        temp_str = output.replace("temp=", "").replace("'C", "")
        return float(temp_str)
    except Exception as e:
        return None

@app.get("/api/temp")
def read_cpu_temp():
    temp = get_cpu_temp()
    if temp is None:
        return {"error": "온도 읽기 실패"}
    return {"temperature": temp, "unit": "°C"}

class ChatRequest(BaseModel):
    message: str
    system: Optional[str] = None 

@app.post("/api/chat")
def chat_with_gpt(req: ChatRequest):
    system_content = req.system or "너는 판교고등학교 QnA 봇이야. 학생들의 질문에 친절하고 정확하게 답변해줘."
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": req.message},
            ],
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
