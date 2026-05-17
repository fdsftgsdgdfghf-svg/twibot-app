"""
POST /api/catalog/description/{chat_id} — обновить описание чата.
Требует заголовок X-User-Id и права администратора (role_priority >= 90).
"""
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum

from db import get_chat_details, is_chat_admin, get_conn, put_conn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://twibot-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DescriptionInput(BaseModel):
    description: str


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


@app.post("/api/catalog/description")
def handler(chat_id: int = Query(...), body: DescriptionInput = None, request: Request = None):
    user_id = get_user_id(request)
    if get_chat_details(chat_id) is None:
        raise HTTPException(status_code=404, detail="Чат не найден")
    if not is_chat_admin(chat_id, user_id):
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    if len(body.description) > 1000:
        raise HTTPException(status_code=400, detail="Описание не может быть длиннее 1000 символов")
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE registered_chats SET description = %s WHERE chat_id = %s", (body.description, chat_id))
        conn.commit()
    finally:
        put_conn(conn)
    return {"status": "ok", "description": body.description}


handler = Mangum(app)
