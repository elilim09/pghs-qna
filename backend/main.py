from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import Optional

# -------------------------------
# 환경변수 로드 및 OpenAI 초기화
# -------------------------------
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# -------------------------------
# CORS 설정: 정확히 허용할 도메인만
# -------------------------------
origins = [
    "https://hwanghj09.p-e.kr",        # 배포한 HTTPS 도메인
    "https://<your-firebase>.web.app"  # Firebase Hosting 도메인
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# CPU 온도 읽기
# -------------------------------
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

# -------------------------------
# 채팅 요청 모델
# -------------------------------
class ChatRequest(BaseModel):
    message: str
    system: Optional[str] = None

# -------------------------------
# 채팅 엔드포인트
# -------------------------------
@app.post("/api/chat")
def chat_with_gpt(req: ChatRequest):
    system_content = req.system or "너는 판교고등학교 QnA 봇입니다."
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": req.message},
            ],
        )
        print(response.choices[0].message.content)
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# Health check
# -------------------------------
@app.get("/api/health")
def health_check():
    return {"status": "ok"}
