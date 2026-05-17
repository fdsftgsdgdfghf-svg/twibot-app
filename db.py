"""
Модуль работы с PostgreSQL (Supabase / Neon.tech).
Таблицы создаются автоматически при первом импорте.
"""
import os
from typing import Any

import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool

DATABASE_URL = os.environ.get("DATABASE_URL", "")

_pool: ThreadedConnectionPool | None = None


def get_pool() -> ThreadedConnectionPool:
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(1, 10, DATABASE_URL)
        _init_db()
    return _pool


def get_conn():
    return get_pool().getconn()


def put_conn(conn):
    get_pool().putconn(conn)


def _init_db() -> None:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS registered_chats (
                chat_id      INTEGER PRIMARY KEY,
                title        TEXT,
                invite_link  TEXT,
                is_open      INTEGER DEFAULT 0,
                description  TEXT DEFAULT '',
                likes_count  INTEGER DEFAULT 0
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_categories (
                chat_id     INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                PRIMARY KEY (chat_id, category_id)
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_likes (
                id         SERIAL PRIMARY KEY,
                chat_id    INTEGER NOT NULL,
                user_id    INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(chat_id, user_id)
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_reports (
                id         SERIAL PRIMARY KEY,
                chat_id    INTEGER NOT NULL,
                user_id    INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_roles (
                chat_id       INTEGER NOT NULL,
                user_id       INTEGER NOT NULL,
                role_priority INTEGER DEFAULT 0,
                PRIMARY KEY (chat_id, user_id)
            )
        """)
        conn.commit()
    finally:
        put_conn(conn)


VALID_CATEGORIES: dict[int, str] = {
    1: "Игры", 2: "Фильмы", 3: "Сериалы", 4: "Аниме", 5: "Музыка",
    6: "Спорт", 7: "Политика", 8: "18+", 9: "Ролевые", 10: "Книги",
}
VALID_CATEGORY_IDS = set(VALID_CATEGORIES)


def get_catalog_chats(
    categories: list[int] | None = None,
    limit: int = 20,
    offset: int = 0,
    sort: str = "likes",
) -> list[dict[str, Any]]:
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        where = "rc.is_open = 1 AND rc.invite_link IS NOT NULL AND rc.invite_link != ''"
        if categories:
            ph = ",".join("%s" for _ in categories)
            cur.execute(
                f"""SELECT rc.chat_id, rc.title, rc.description, rc.likes_count, rc.invite_link
                FROM registered_chats rc
                JOIN chat_categories cc ON cc.chat_id = rc.chat_id
                WHERE {where} AND cc.category_id IN ({ph})
                GROUP BY rc.chat_id
                HAVING COUNT(DISTINCT cc.category_id) = %s
                ORDER BY rc.likes_count DESC
                LIMIT %s OFFSET %s""",
                categories + [len(categories), limit, offset],
            )
        else:
            cur.execute(
                f"""SELECT rc.chat_id, rc.title, rc.description, rc.likes_count, rc.invite_link
                FROM registered_chats rc
                WHERE {where}
                ORDER BY rc.likes_count DESC
                LIMIT %s OFFSET %s""",
                [limit, offset],
            )
        return [dict(r) for r in cur.fetchall()]
    finally:
        put_conn(conn)


def get_chat_details(chat_id: int) -> dict[str, Any] | None:
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT chat_id, title, invite_link, description, likes_count "
            "FROM registered_chats WHERE chat_id = %s", (chat_id,))
        row = cur.fetchone()
        if row is None:
            return None
        chat = dict(row)
        cur.execute(
            "SELECT category_id FROM chat_categories WHERE chat_id = %s ORDER BY category_id",
            (chat_id,))
        cat_ids = [r["category_id"] for r in cur.fetchall()]
        chat["categories"] = [VALID_CATEGORIES[cid] for cid in cat_ids if cid in VALID_CATEGORIES]
        return chat
    finally:
        put_conn(conn)


def toggle_like(chat_id: int, user_id: int) -> tuple[int, bool]:
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT 1 FROM chat_likes WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
        existing = cur.fetchone()
        if existing:
            cur.execute("DELETE FROM chat_likes WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            cur.execute("UPDATE registered_chats SET likes_count = likes_count - 1 WHERE chat_id = %s", (chat_id,))
            liked = False
        else:
            cur.execute("INSERT INTO chat_likes (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
            cur.execute("UPDATE registered_chats SET likes_count = likes_count + 1 WHERE chat_id = %s", (chat_id,))
            liked = True
        conn.commit()
        cur.execute("SELECT likes_count FROM registered_chats WHERE chat_id = %s", (chat_id,))
        row = cur.fetchone()
        count = row["likes_count"] if row else 0
        return count, liked
    finally:
        put_conn(conn)


def is_chat_admin(chat_id: int, user_id: int) -> bool:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT role_priority FROM chat_roles WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
        row = cur.fetchone()
        return row is not None and row[0] >= 90
    finally:
        put_conn(conn)


def add_report(chat_id: int, user_id: int) -> None:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO chat_reports (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
        conn.commit()
    finally:
        put_conn(conn)
