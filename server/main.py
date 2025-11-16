# server/main.py  (or wherever your FastAPI app is defined)

import os
import asyncio
import logging
from typing import AsyncIterator

from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from sqlalchemy import text  # type: ignore

from .db import engine, SessionLocal
from .init_db import ensure_database_and_schema
from .routers import journey_routes, auth_routes, ai_routes,checkin_routes

log = logging.getLogger("mendly.startup")
logging.basicConfig(level=logging.INFO)

INIT_DB_ON_STARTUP = os.getenv("INIT_DB_ON_STARTUP", "1") == "1"
DB_WARMUP_ON_STARTUP = os.getenv("DB_WARMUP_ON_STARTUP", "0") == "1"
DB_PING_TIMEOUT_SEC = float(os.getenv("DB_PING_TIMEOUT_SEC", "1.5"))

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1",
]

async def _ping_db_quick() -> None:
    """Tiny best-effort ping; never block startup."""
    if DB_PING_TIMEOUT_SEC <= 0:
        log.info("[startup] quick DB ping disabled.")
        return

    def _do_ping():
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))

    try:
        await asyncio.wait_for(asyncio.to_thread(_do_ping), timeout=DB_PING_TIMEOUT_SEC)
        log.info("[startup] quick DB ping OK.")
    except asyncio.TimeoutError:
        # Timeout is common on cold starts—treat as informational, not warning
        log.info("[startup] quick DB ping skipped (took > %.1fs). Continuing boot.", DB_PING_TIMEOUT_SEC)
    except Exception as e:
        # Real errors still get logged
        log.warning("[startup] quick DB ping failed: %r", e)

def _safe_init_db():
    try:
        ensure_database_and_schema()
        log.info("[startup] ensure_database_and_schema finished.")
    except Exception as e:
        log.error("[startup] ensure_database_and_schema failed: %r", e)

def _safe_db_warmup():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        log.info("[startup] DB warmup OK.")
    except Exception as e:
        log.info("[startup] DB warmup skipped/failed: %r", e)

async def lifespan(app: FastAPI):
    if INIT_DB_ON_STARTUP:
        asyncio.create_task(asyncio.to_thread(_safe_init_db))
    if DB_WARMUP_ON_STARTUP:
        asyncio.create_task(asyncio.to_thread(_safe_db_warmup))

    # Best-effort ping (won’t warn on normal timeouts anymore)
    await _ping_db_quick()
    yield

async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Fire-and-forget tasks that should NOT block startup
    # (they run in background threads)
    if INIT_DB_ON_STARTUP:
        asyncio.create_task(asyncio.to_thread(_safe_init_db))
    if DB_WARMUP_ON_STARTUP:
        asyncio.create_task(asyncio.to_thread(_safe_db_warmup))

    # Optional tiny ping with strict timeout so we never block boot
    await _ping_db_quick()

    yield

    # (no shutdown work needed)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_routes.router)
app.include_router(journey_routes.router)
app.include_router(ai_routes.router)
app.include_router(checkin_routes.router)

@app.get("/health/db")
def health_db():
    with engine.connect() as conn:
        return {"ok": True, "time": str(conn.execute(text("SELECT SYSDATETIMEOFFSET()")).scalar_one())}
