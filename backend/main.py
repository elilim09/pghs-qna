"""Utility helpers for Firebase Functions HTTP triggers.

This module deliberately keeps only the request helpers that will be reused
from Cloud Functions, allowing the frontend to call a unified HTTP endpoint.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

import os
import requests

API_BASE_URL = os.getenv("PGHS_EXTERNAL_API", "https://example.com")
TIMEOUT_SECONDS = float(os.getenv("PGHS_API_TIMEOUT", "10"))


@dataclass
class ChatPayload:
    """Structured payload for chatbot requests."""

    session_id: str
    message: str
    locale: str = "ko-KR"
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "session_id": self.session_id,
            "message": self.message,
            "locale": self.locale,
        }
        if self.metadata:
            payload["metadata"] = self.metadata
        return payload


def _request(path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Send a JSON request to the configured API endpoint."""

    url = f"{API_BASE_URL.rstrip('/')}/{path.lstrip('/')}"
    response = requests.post(url, json=payload, timeout=TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


def send_chat_request(chat_payload: ChatPayload) -> Dict[str, Any]:
    """Helper used from Firebase Functions to route chat completions."""

    return _request("chat", chat_payload.to_dict())


def send_knowledge_lookup(query: str, *, tags: Optional[list[str]] = None) -> Dict[str, Any]:
    """Proxy knowledge lookups through the same backend service."""

    payload: Dict[str, Any] = {"query": query}
    if tags:
        payload["tags"] = tags
    return _request("knowledge", payload)
