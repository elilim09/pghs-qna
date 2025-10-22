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
    system_content = req.system or "너는 판교고등학교에 대해 매우 잘 아는 친절한 도우미이며, 학생 혹은 학부모들의 질문에 대한 Q&A를 담당하고 있어. 사용자들이 묻는 질문에 '업로드 되어있는 공식 파일'만을 참고하여, 거짓 정보없이 정확하고 도움이 되는 답변을 '최고의 역량을 발휘하여' 제공해."
    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": req.message},
            ],
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
