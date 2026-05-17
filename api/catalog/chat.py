"""
GET /api/catalog/chat/{chat_id} — детальная информация о чате.
Параметр chat_id передаётся через query string благодаря rewrite в vercel.json.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from db import get_chat_details

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://twibot-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/catalog/chat")
def handler(chat_id: int = Query(...)):
    chat = get_chat_details(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Чат не найден")
    return {
        "chat_id": chat["chat_id"],
        "title": chat.get("title"),
        "invite_link": chat.get("invite_link"),
        "description": chat.get("description") or "",
        "categories": chat.get("categories", []),
        "likes_count": chat.get("likes_count") or 0,
    }


handler = Mangum(app)
