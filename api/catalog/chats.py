"""
GET /api/catalog/chats — список чатов с пагинацией и фильтрацией.
"""
import psycopg2.extras
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from db import VALID_CATEGORIES, VALID_CATEGORY_IDS, get_catalog_chats, get_conn, put_conn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://twibot-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/catalog/chats")
def handler(
    categories: str = Query(""),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    sort: str = Query("likes", pattern="^(likes|activity)$"),
):
    cat_ids: list[int] = []
    if categories:
        for part in categories.split(","):
            part = part.strip()
            if part.isdigit() and int(part) in VALID_CATEGORY_IDS:
                cat_ids.append(int(part))

    raw = get_catalog_chats(
        categories=cat_ids if cat_ids else None,
        limit=limit,
        offset=offset,
        sort=sort,
    )

    chat_ids = [r["chat_id"] for r in raw]
    cats_cache: dict[int, list[str]] = {}
    if chat_ids:
        conn = get_conn()
        try:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            ph = ",".join("%s" for _ in chat_ids)
            cur.execute(
                f"SELECT chat_id, category_id FROM chat_categories "
                f"WHERE chat_id IN ({ph}) ORDER BY chat_id, category_id",
                chat_ids,
            )
            for row in cur.fetchall():
                cid = row["chat_id"]
                cat_name = VALID_CATEGORIES.get(row["category_id"])
                if cat_name is not None:
                    cats_cache.setdefault(cid, []).append(cat_name)
        finally:
            put_conn(conn)

    items = []
    for r in raw:
        items.append({
            "chat_id": r["chat_id"],
            "title": r.get("title"),
            "categories": cats_cache.get(r["chat_id"], []),
            "description": r.get("description") or "",
            "likes_count": r.get("likes_count") or 0,
        })

    return {"items": items}


handler = Mangum(app)
