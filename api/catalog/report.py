"""
POST /api/catalog/report/{chat_id} — пожаловаться на неработающую ссылку.
Параметр chat_id передаётся через query string. Требуется заголовок X-User-Id.
"""
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from db import get_chat_details, add_report

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://twibot-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_user_id(request: Request) -> int:
    raw = request.headers.get("X-User-Id")
    if raw is None:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")
    try:
        uid = int(raw)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid X-User-Id")
    if uid <= 0:
        raise HTTPException(status_code=403, detail="Forbidden")
    return uid

@app.post("/api/catalog/report")
def handler(chat_id: int = Query(...), request: Request = None):
    user_id = get_user_id(request)
    if get_chat_details(chat_id) is None:
        raise HTTPException(status_code=404, detail="Чат не найден")
    add_report(chat_id, user_id)
    return {"status": "ok", "message": "Жалоба отправлена"}

