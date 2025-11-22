# server/notification_worker.py
import asyncio
import json
import logging
import threading

from sqlalchemy import text
from .db import SessionLocal
from .firebase_client import send_push_to_token

log = logging.getLogger("mendly.notifications")

# Default polling interval (seconds) – used if caller doesn't override
POLL_INTERVAL_SECONDS = 15


async def _send_one_job(db, job_row) -> None:
    job_id = job_row.job_id
    user_id = job_row.user_id
    purpose = job_row.purpose
    payload_json = job_row.payload_json

    # find an active device token for this user
    token_row = db.execute(
        text(
            """
            SELECT TOP 1 fcm_token
            FROM dbo.UserDeviceTokens
            WHERE user_id = :uid AND is_active = 1
            ORDER BY last_seen DESC
            """
        ),
        {"uid": user_id},
    ).fetchone()

    if not token_row:
        log.info("No active device token for user %s (job %s)", user_id, job_id)
        return

    fcm_token = token_row.fcm_token

    try:
        payload = json.loads(payload_json)
    except Exception:
        payload = {}
    title = payload.get("title", "Mendly")
    body = payload.get("body", "You have a new notification")

    # send via FCM (this uses your firebase_client.py)
    ok, err = send_push_to_token(
        token=fcm_token,
        title=title,
        body=body,
        data={"purpose": purpose},
    )
    if ok:
        db.execute(
            text(
                """
                UPDATE dbo.NotificationQueue
                SET status = N'sent',
                    sent_at = SYSDATETIMEOFFSET()
                WHERE job_id = :jid
                """
            ),
            {"jid": job_id},
        )
        log.info(
            "Sent notification job %s (purpose=%s) to user %s",
            job_id,
            purpose,
            user_id,
        )
    else:
        db.execute(
            text(
                """
                UPDATE dbo.NotificationQueue
                SET status = N'failed',
                    error = :err,
                    sent_at = SYSDATETIMEOFFSET()
                WHERE job_id = :jid
                """
            ),
            {"jid": job_id, "err": err or "unknown error"},
        )
        log.warning("Failed to send notification job %s: %s", job_id, err)


async def notification_loop(poll_interval: float = POLL_INTERVAL_SECONDS) -> None:
    """
    Main worker loop:
    - Polls NotificationQueue for pending jobs whose scheduled_at is in the past.
    - Sends them via FCM.
    - Sleeps poll_interval seconds between cycles.
    """
    if poll_interval <= 0:
        poll_interval = POLL_INTERVAL_SECONDS

    log.info("notification_loop started with poll_interval=%.1f s", poll_interval)

    while True:
        try:
            with SessionLocal() as db:
                jobs = db.execute(
                    text(
                        """
                        SELECT TOP 50 job_id, user_id, purpose, payload_json
                        FROM dbo.NotificationQueue
                        WHERE status = N'pending'
                          AND scheduled_at <= SYSDATETIMEOFFSET()
                        ORDER BY scheduled_at
                        """
                    )
                ).fetchall()

                if not jobs:
                    # nothing to do
                    await asyncio.sleep(poll_interval)
                    continue

                for job in jobs:
                    await _send_one_job(db, job)

                db.commit()
        except Exception as e:
            log.exception("Error in notification_loop: %r", e)

        await asyncio.sleep(poll_interval)


def _worker_thread_main(poll_interval: float) -> None:
    """
    Runs in a separate background thread.
    Creates its own event loop and runs the async notification_loop there.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(notification_loop(poll_interval))
    finally:
        loop.close()


def start_worker(interval_seconds: float | int = POLL_INTERVAL_SECONDS) -> None:
    """
    Entry point called from main.py during startup.

    main.py calls:
        start_worker(interval_seconds=NOTIF_WORKER_INTERVAL_SEC)

    We start a *background thread* so we don't conflict with FastAPI's event loop.
    """
    try:
        poll_interval = float(interval_seconds)
    except Exception:
        poll_interval = POLL_INTERVAL_SECONDS

    if poll_interval <= 0:
        poll_interval = POLL_INTERVAL_SECONDS

    log.info(
        "Starting notification worker thread with poll_interval=%.1f s",
        poll_interval,
    )

    t = threading.Thread(
        target=_worker_thread_main,
        args=(poll_interval,),
        daemon=True,
        name="mendly-notification-worker",
    )
    t.start()
