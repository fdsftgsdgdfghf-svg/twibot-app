from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/catalog/chat/{chat_id}")
async def get_chat(chat_id: int):
    return {"id": chat_id, "title": "Тестовый чат", "likes_count": 0}

handler = app