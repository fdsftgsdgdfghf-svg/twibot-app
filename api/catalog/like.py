"""
POST /api/catalog/like/{chat_id} — поставить/убрать лайк (toggle).
Параметр chat_id передаётся через query string. Требуется заголовок X-User-Id.
"""
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from db import toggle_like, get_chat_details

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

@app.post("/api/catalog/like")
def handler(chat_id: int = Query(...), request: Request = None):
    user_id = get_user_id(request)
    if get_chat_details(chat_id) is None:
        raise HTTPException(status_code=404, detail="Чат не найден")
    count, liked = toggle_like(chat_id, user_id)
    return {"liked": liked, "likes_count": count}

