# server/notification_worker.py
import asyncio
import json
import logging
from datetime import datetime, timezone

from sqlalchemy import text
from .db import SessionLocal
from .firebase_client import send_push_to_token

log = logging.getLogger("mendly.notifications")

POLL_INTERVAL_SECONDS = 15  # how often to check DB


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
      return

  fcm_token = token_row.fcm_token

  # parse payload
  try:
      payload = json.loads(payload_json)
  except Exception:
      payload = {}

  title = payload.get("title", "Mendly")
  body = payload.get("body", "You have a new notification")

  # ---- SEND VIA FCM ----
  # normalize any return shape from send_push_to_token into (ok, err)
  try:
      send_result = send_push_to_token(
          token=fcm_token,
          title=title,
          body=body,
          data={"purpose": purpose},
      )
      ok: bool
      err: str | None

      if isinstance(send_result, tuple):
          if len(send_result) == 2:
              ok, err = send_result
          else:
              # e.g. (ok, err, message_id) -> take first two
              ok = bool(send_result[0])
              err = send_result[1] if len(send_result) > 1 else None
      else:
          # e.g. just a message_id string or True/False
          ok = bool(send_result)
          err = None
  except Exception as e:
      ok = False
      err = str(e)
      log.warning("FCM send raised exception for job %s: %r", job_id, e)

  # ---- UPDATE DB STATUS ----
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


async def notification_loop(poll_interval: int = POLL_INTERVAL_SECONDS) -> None:
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
                    AND purpose IN (N'checkin_reminder', N'weekly_summary')  -- ignore 'tip'
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


def start_worker(interval_seconds: int = POLL_INTERVAL_SECONDS) -> None:
  """
  Called from main.py in a background thread/process.
  """
  log.info(
      "[notifications] background worker starting (interval=%s)",
      interval_seconds,
  )
  loop = asyncio.new_event_loop()
  asyncio.set_event_loop(loop)
  loop.run_until_complete(notification_loop(interval_seconds))
