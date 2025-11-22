# server/main.py

import os
import asyncio
import logging
from typing import AsyncIterator

from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from sqlalchemy import text  # type: ignore

from .db import engine, SessionLocal
from .init_db import ensure_database_and_schema
from .routers import (
    journey_routes,
    auth_routes,
    ai_routes,
    checkin_routes,
    positive_notifications_routes,
    device_routes,
)
from .notification_worker import start_worker  # <-- background sender

log = logging.getLogger("mendly.startup")
logging.basicConfig(level=logging.INFO)

INIT_DB_ON_STARTUP = os.getenv("INIT_DB_ON_STARTUP", "1") == "1"
DB_WARMUP_ON_STARTUP = os.getenv("DB_WARMUP_ON_STARTUP", "0") == "1"
DB_PING_TIMEOUT_SEC = float(os.getenv("DB_PING_TIMEOUT_SEC", "1.5"))
NOTIF_WORKER_INTERVAL_SEC = int(os.getenv("NOTIF_WORKER_INTERVAL_SEC", "60"))

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
        await asyncio.wait_for(
            asyncio.to_thread(_do_ping),
            timeout=DB_PING_TIMEOUT_SEC,
        )
        log.info("[startup] quick DB ping OK.")
    except asyncio.TimeoutError:
        # Timeout is common on cold starts—informational only
        log.info(
            "[startup] quick DB ping skipped (took > %.1fs). Continuing boot.",
            DB_PING_TIMEOUT_SEC,
        )
    except Exception as e:
        log.warning("[startup] quick DB ping failed: %r", e)


def _safe_init_db() -> None:
    try:
        ensure_database_and_schema()
        log.info("[startup] ensure_database_and_schema finished.")
    except Exception as e:
        log.error("[startup] ensure_database_and_schema failed: %r", e)


def _safe_db_warmup() -> None:
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        log.info("[startup] DB warmup OK.")
    except Exception as e:
        log.info("[startup] DB warmup skipped/failed: %r", e)


async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan:
    - kick off DB init / warmup in background threads
    - start notification worker
    - do a quick best-effort DB ping
    """
    # Fire-and-forget tasks (do not block startup)
    if INIT_DB_ON_STARTUP:
        asyncio.create_task(asyncio.to_thread(_safe_init_db))
    if DB_WARMUP_ON_STARTUP:
        asyncio.create_task(asyncio.to_thread(_safe_db_warmup))

    # Start background notification worker (reads NotificationQueue + sends FCM)
    start_worker(interval_seconds=NOTIF_WORKER_INTERVAL_SEC)

    # Optional tiny ping with strict timeout
    await _ping_db_quick()

    # ---- app is now running ----
    yield

    # No special shutdown logic needed


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
app.include_router(positive_notifications_routes.router)
app.include_router(device_routes.router)


@app.get("/health/db")
def health_db():
    with engine.connect() as conn:
        return {
            "ok": True,
            "time": str(
                conn.execute(text("SELECT SYSDATETIMEOFFSET()")).scalar_one()
            ),
        }
