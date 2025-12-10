# server/routers/screenings_routes.py
from datetime import date
from typing import Literal, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..deps import get_db
from .auth_routes import _user_id_from_authorization

router = APIRouter(
    prefix="/screenings",
    tags=["screenings"],
)


# ---------- Schemas ----------

class Phq2Submission(BaseModel):
    type: Literal["PHQ-2"]
    totalScore: int = Field(..., ge=0, le=6)
    answers: List[int]  # each 0–3


class ScreeningStatus(BaseModel):
    last_phq2_date: Optional[date] = None


# ---------- Routes ----------

@router.post("/phq2", status_code=204)
def submit_phq2(
    payload: Phq2Submission,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    """
    Store PHQ-2 result (for now: just mark today's date on UserSettings).
    You can extend this later to log full results in a dedicated table.
    """

    # basic guard on answers
    if any(a < 0 or a > 3 for a in payload.answers):
        raise HTTPException(status_code=400, detail="Invalid PHQ-2 answers")

    today = date.today()

    # update UserSettings.last_phq2_date (row should already exist via trigger)
    result = db.execute(
        text(
            """
            UPDATE dbo.UserSettings
            SET last_phq2_date = :today,
                updated_at = SYSDATETIMEOFFSET()
            WHERE user_id = :uid
            """
        ),
        {"today": today, "uid": user_id},
    )

    # in case, for some reason, there was no UserSettings row (very rare)
    if result.rowcount == 0:
        db.execute(
            text(
                """
                INSERT INTO dbo.UserSettings
                    (user_id, checkin_frequency, motivation_enabled, 
                     positive_notif_enabled, positive_notif_interval_minutes, last_phq2_date)
                VALUES
                    (:uid, 3, 1, 1, 60, :today)
                """
            ),
            {"uid": user_id, "today": today},
        )

    db.commit()
    return


@router.get("/status")
def screening_status(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    row = db.execute(
        text(
            """
            SELECT last_phq2_date, last_photo_memory_date
            FROM dbo.UserSettings
            WHERE user_id = :uid
            """
        ),
        {"uid": user_id},
    ).fetchone()

    if not row:
        # fallback if settings row not created yet
        return {
            "last_phq2_date": None,
            "last_photo_memory_date": None,
        }

    return {
        "last_phq2_date": (
            row.last_phq2_date.isoformat() if row.last_phq2_date else None
        ),
        "last_photo_memory_date": (
            row.last_photo_memory_date.isoformat()
            if row.last_photo_memory_date
            else None
        ),
    }


@router.post("/photo-popup-seen")
def mark_photo_popup_seen(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    today = date.today()

    db.execute(
        text(
            """
            UPDATE dbo.UserSettings
            SET last_photo_memory_date = :today,
                updated_at = SYSDATETIMEOFFSET()
            WHERE user_id = :uid
            """
        ),
        {"today": today, "uid": user_id},
    )
    db.commit()

    return {"ok": True, "last_photo_memory_date": today.isoformat()}
