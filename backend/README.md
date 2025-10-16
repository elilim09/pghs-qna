# Pangyo High School Q&A Backend

이 디렉터리는 FastAPI 기반의 백엔드 프로토타입입니다. 현재는 프론트엔드 개발을 우선하기 위해 최소한의 엔드포인트만 제공하며, 추후 AI 챗봇 및 검색 API를 연결하기 위한 구조를 제안합니다.

## 사용 방법

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

서버가 실행되면 `http://127.0.0.1:8000/docs`에서 OpenAPI 문서를 통해 기본 엔드포인트를 확인할 수 있습니다.

## 제공 엔드포인트

- `GET /health`: 배포/모니터링을 위한 헬스체크
- `GET /knowledge`: 정적 지식 항목 예시 반환
- `POST /chat`: 프론트엔드 연동을 위한 챗봇 응답 형식 예시(에코)

> ⚠️ 현재 API는 목업 데이터만 반환하며, 실제 AI 모델 연동은 추후 구현 예정입니다.
