from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
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

# 허용할 도메인 리스트
# 라즈베리파이 공인 IP 또는 연결된 도메인으로 설정
origins = [
    "http://localhost:3000",            # 로컬 개발
    "https://pangyo-qna.web.app",       # Firebase Hosting
    "https://student1.1jy2.com",        # 라즈베리파이 도메인
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CPU 온도 읽기
def get_cpu_temp():
    try:
        result = subprocess.run(['vcgencmd', 'measure_temp'], capture_output=True, text=True)
        output = result.stdout.strip()
        temp_str = output.replace("temp=", "").replace("'C", "")
        return float(temp_str)
    except Exception:
        return None

@app.get("/api/temp")
def read_cpu_temp():
    temp = get_cpu_temp()
    if temp is None:
        return {"error": "온도 읽기 실패"}
    return {"temperature": temp, "unit": "°C"}

# 채팅 요청 모델
class ChatRequest(BaseModel):
    message: str
    system: Optional[str] = None

@app.post("/api/chat")
def chat_with_gpt(req: ChatRequest):
    system_content = req.system or "너는 판교고등학교 QnA 봇이며, 학생 질문에 친절하고 정확하게 답변해."
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
