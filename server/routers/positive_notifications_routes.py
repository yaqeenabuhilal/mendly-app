# server/routers/positive_notifications_routes.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
import json

from ..deps import get_db
from .auth_routes import _user_id_from_authorization

router = APIRouter(
    prefix="/positive-notifications",
    tags=["positive_notifications"],
)

# ---------- Schemas ----------

class PositiveNotificationSettings(BaseModel):
    enabled: bool = Field(
        ...,
        description="Whether positive notifications are on or off",
    )
    frequency_minutes: int = Field(
        ...,
        ge=1,
        le=1440 * 7,  # up to one week
        description="Interval between notifications in minutes",
    )


class TestPositiveNotification(BaseModel):
    # optional custom body for test push
    body: str | None = None


# ---------- Helpers ----------

def _row_to_settings(row) -> PositiveNotificationSettings:
    """
    Convert a SQL row to PositiveNotificationSettings, with safe defaults.
    """
    if row is None:
        # No row in UserSettings yet for this user -> defaults
        return PositiveNotificationSettings(enabled=True, frequency_minutes=60)

    enabled = (
        bool(row.positive_notif_enabled)
        if row.positive_notif_enabled is not None
        else True
    )
    freq = (
        int(row.positive_notif_interval_minutes)
        if row.positive_notif_interval_minutes is not None
        else 60
    )

    return PositiveNotificationSettings(enabled=enabled, frequency_minutes=freq)


# ---------- Routes ----------

@router.get("/settings", response_model=PositiveNotificationSettings)
def get_positive_notifications_settings(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    """
    Return the positive notification settings for the current user.
    Falls back to sensible defaults if missing.
    """
    row = db.execute(
        text(
            """
            SELECT TOP 1
                positive_notif_enabled,
                positive_notif_interval_minutes
            FROM dbo.UserSettings
            WHERE user_id = :uid
            """
        ),
        {"uid": user_id},
    ).fetchone()

    return _row_to_settings(row)


@router.post("/settings", response_model=PositiveNotificationSettings)
def update_positive_notifications_settings(
    payload: PositiveNotificationSettings,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    """
    Update (or create) the positive notification settings for this user
    in dbo.UserSettings.
    """

    # First try to update an existing row
    result = db.execute(
        text(
            """
            UPDATE dbo.UserSettings
            SET
                positive_notif_enabled = :enabled,
                positive_notif_interval_minutes = :freq
            WHERE user_id = :uid
            """
        ),
        {
            "uid": user_id,
            "enabled": 1 if payload.enabled else 0,
            "freq": payload.frequency_minutes,
        },
    )

    # If no row was updated, insert a new one with basic defaults
    if result.rowcount == 0:
        db.execute(
            text(
                """
                INSERT INTO dbo.UserSettings
                    (user_id,
                     checkin_frequency,
                     motivation_enabled,
                     positive_notif_enabled,
                     positive_notif_interval_minutes)
                VALUES
                    (:uid, :checkin_freq, :motivation_on, :enabled, :freq)
                """
            ),
            {
                "uid": user_id,
                "checkin_freq": 1,        # default check-in frequency
                "motivation_on": 1,       # default motivation enabled
                "enabled": 1 if payload.enabled else 0,
                "freq": payload.frequency_minutes,
            },
        )

    db.commit()
    return payload


# ---------- Test notification ----------

@router.post("/send-test", status_code=204)
def send_test_positive_notification(
    payload: TestPositiveNotification,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    """
    Enqueue a single test positive notification for this user.

    IMPORTANT:
    We use purpose='checkin_reminder' because the existing
    notification_worker already knows how to process that purpose.
    """
    # 1) Optional custom message body
    message_body = (
        payload.body
        or "This is a test positive notification from Mendly 🌱"
    )

    # 2) Pick latest active device token from UserDeviceTokens
    #    (your columns: token_id, user_id, platform, fcm_token, last_seen, is_active)
    token_row = db.execute(
        text(
            """
            SELECT TOP 1 token_id
            FROM dbo.UserDeviceTokens
            WHERE user_id = :uid AND is_active = 1
            ORDER BY last_seen DESC
            """
        ),
        {"uid": user_id},
    ).fetchone()

    token_id = token_row.token_id if token_row is not None else None

    # 3) Build payload json – worker will send title/body from this
    payload_json = json.dumps(
        {
            "title": "Mendly • Test positive message",
            "body": message_body,
            "kind": "test_positive",
        }
    )

    # 4) Insert into NotificationQueue with purpose that worker already handles
    db.execute(
        text(
            """
            INSERT INTO dbo.NotificationQueue
                (user_id, token_id, purpose, payload_json, scheduled_at, status)
            VALUES
                (:uid, :token_id, N'checkin_reminder', :payload_json,
                 SYSDATETIMEOFFSET(), N'pending')
            """
        ),
        {
            "uid": user_id,
            "token_id": token_id,          # can be NULL – same as older rows
            "payload_json": payload_json,
        },
    )

    db.commit()
    # 204 No Content
    return
