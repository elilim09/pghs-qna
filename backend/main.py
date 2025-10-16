"""FastAPI backend stub for the Pangyo High School Q&A project."""
from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Pangyo High School Q&A API",
    description="Placeholder API for future chatbot and knowledge services.",
    version="0.1.0",
)


class KnowledgeItem(BaseModel):
    question: str
    answer: str
    tags: List[str]
    source: str


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    created_at: datetime


MOCK_KNOWLEDGE: List[KnowledgeItem] = [
    KnowledgeItem(
        question="2025학년도 모집 정원과 학급 구성은 어떻게 되나요?",
        answer="한 학급당 26명씩 8학급, 총 208명을 모집합니다.",
        tags=["모집정원", "2025"],
        source="판교고등학교_QNA.pdf",
    ),
]


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Return a simple health check payload."""
    return {"status": "ok", "service": "pangyo-qna"}


@app.get("/knowledge", response_model=List[KnowledgeItem], tags=["knowledge"])
async def list_knowledge() -> List[KnowledgeItem]:
    """Provide a small subset of the curated knowledge base for prototypes."""
    return MOCK_KNOWLEDGE


@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat_with_placeholder(request: ChatRequest) -> ChatResponse:
    """Echo the incoming message to demonstrate the API contract."""
    return ChatResponse(
        reply=(
            "현재는 데모 API입니다. 프론트엔드에서 제공되는 정보를 확인해 주시고, "
            f"실제 답변은 추후 AI 연동 후 제공될 예정입니다. 질문: {request.message}"
        ),
        created_at=datetime.utcnow(),
    )
