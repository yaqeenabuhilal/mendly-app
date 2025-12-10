# server/main.py

import os
import asyncio
import logging
import threading
from typing import AsyncIterator
from pathlib import Path  # <-- added
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI  # type: ignore
from fastapi.staticfiles import StaticFiles  # <-- added
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
    support_routes,
    screenings_routes,
    photo_memory_routes,
)
from .notification_worker import start_worker  # <-- background sender

log = logging.getLogger("mendly.startup")
logging.basicConfig(level=logging.INFO)

INIT_DB_ON_STARTUP = os.getenv("INIT_DB_ON_STARTUP", "1") == "1"
DB_WARMUP_ON_STARTUP = os.getenv("DB_WARMUP_ON_STARTUP", "0") == "1"
DB_PING_TIMEOUT_SEC = float(os.getenv("DB_PING_TIMEOUT_SEC", "1.5"))

# notification worker settings
NOTIF_WORKER_ENABLED = os.getenv("NOTIF_WORKER_ENABLED", "1") == "1"
NOTIF_WORKER_INTERVAL_SEC = int(os.getenv("NOTIF_WORKER_INTERVAL_SEC", "60"))

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1",
    "capacitor://localhost",
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
  - start notification worker in its own thread
  - do a quick best-effort DB ping
  """
  # Fire-and-forget tasks (do not block startup)
  if INIT_DB_ON_STARTUP:
      asyncio.create_task(asyncio.to_thread(_safe_init_db))
  if DB_WARMUP_ON_STARTUP:
      asyncio.create_task(asyncio.to_thread(_safe_db_warmup))

  # Optional tiny ping with strict timeout
  await _ping_db_quick()

  # Start background notification worker (reads NotificationQueue + sends FCM)
  if NOTIF_WORKER_ENABLED:
      def _run_worker():
          start_worker(interval_seconds=NOTIF_WORKER_INTERVAL_SEC)

      t = threading.Thread(target=_run_worker, daemon=True)
      t.start()
      log.info(
          "[startup] notification worker thread started (interval=%ss)",
          NOTIF_WORKER_INTERVAL_SEC,
      )

  # ---- app is now running ----
  yield
  # No special shutdown logic needed


app = FastAPI(lifespan=lifespan)

# ---- CORS ----
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# ---- MEDIA / STATIC FILES ----
# Project root = parent of "server" package
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MEDIA_ROOT = PROJECT_ROOT / "media"
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

# This is what allows GET /media/.... to work
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")

# ---- Routers ----
app.include_router(auth_routes.router)
app.include_router(journey_routes.router)
app.include_router(ai_routes.router)
app.include_router(checkin_routes.router)
app.include_router(positive_notifications_routes.router)
app.include_router(device_routes.router)
app.include_router(support_routes.router)
app.include_router(screenings_routes.router)
app.include_router(photo_memory_routes.router)


@app.get("/health/db")
def health_db():
  with engine.connect() as conn:
      return {
          "ok": True,
          "time": str(
              conn.execute(text("SELECT SYSDATETIMEOFFSET()")).scalar_one()
          ),
      }
