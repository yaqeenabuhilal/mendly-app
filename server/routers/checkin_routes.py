from datetime import datetime, timedelta, timezone, date
from typing import Optional, List
import json

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..deps import get_db
from .auth_routes import _user_id_from_authorization

router = APIRouter(prefix="/checkin", tags=["checkin"])

# ---------- Schemas ----------
class CheckinPayload(BaseModel):
    score: Optional[int] = Field(None, ge=0, le=10)
    label: Optional[str] = None
    note: Optional[str] = None  # saved to text_note_encrypted (varbinary)

class CheckinResponse(BaseModel):
    saved: bool
    streak_days: int
    avg_7d: Optional[float]
    avg_14d: Optional[float]
    avg_30d: Optional[float]

# ---------- Helpers ----------
def _compute_streak(db: Session, uid: str) -> int:
    rows = db.execute(
        text("""
            SELECT CAST(captured_at AS date) AS d
            FROM dbo.MoodEntries
            WHERE user_id = :uid
            GROUP BY CAST(captured_at AS date)
            ORDER BY d DESC
        """),
        {"uid": uid},
    ).fetchall()

    days: List[date] = [r.d if isinstance(r.d, date) else r.d.date() for r in rows]
    if not days:
        return 0

    streak = 0
    cursor = datetime.now(timezone.utc).date()
    for d in days:
        if d == cursor:
            streak += 1
            cursor = date.fromordinal(cursor.toordinal() - 1)
        elif d > cursor:
            continue
        else:
            break
    return streak

def _rolling_avg(db: Session, uid: str, days: int) -> Optional[float]:
    cut = datetime.now(timezone.utc) - timedelta(days=days)
    r = db.execute(
        text("""
            SELECT AVG(CAST(score AS float)) AS a
            FROM dbo.MoodEntries
            WHERE user_id = :uid AND captured_at >= :cut
        """),
        {"uid": uid, "cut": cut},
    ).fetchone()
    return float(r.a) if r and r.a is not None else None

# ---------- Route ----------
@router.post("", response_model=CheckinResponse, status_code=status.HTTP_201_CREATED)
def create_checkin(
    payload: CheckinPayload,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    # allow sending without emoji: default score to 5 (NOT NULL column)
    score_to_save = payload.score if payload.score is not None else 5
    label_to_save = payload.label or None
    note_to_save  = payload.note or None  # str -> will convert to varbinary below

    # map the score to the emoji we show in the UI (for storage in emojis_json)
    emoji_map = {
        1: "😞",
        3: "☹️",
        5: "😐",
        7: "🙂",
        9: "😊",
        10: "😁",
    }
    emoji_selected = emoji_map.get(score_to_save)
    emoji_json = json.dumps({"selected": emoji_selected, "score": score_to_save}) if emoji_selected else None

    # IMPORTANT:
    # - text_note_encrypted is VARBINARY(MAX) -> convert NVARCHAR to VARBINARY
    # - emojis_json is assumed NVARCHAR(MAX); we pass JSON text
    db.execute(
        text("""
            INSERT INTO dbo.MoodEntries
                (user_id, score, label, text_note_encrypted, emojis_json, captured_at)
            VALUES
                (:uid, :score, :label, CONVERT(varbinary(max), :note), :emoji_json, :ts)
        """),
        {
            "uid": user_id,
            "score": score_to_save,
            "label": label_to_save,
            "note": note_to_save,             # None -> NULL, text -> VARBINARY
            "emoji_json": emoji_json,         # JSON string or NULL
            "ts": now,
        },
    )
    db.commit()

    # Adherence stats
    streak = _compute_streak(db, user_id)
    avg7 = _rolling_avg(db, user_id, 7)
    avg14 = _rolling_avg(db, user_id, 14)
    avg30 = _rolling_avg(db, user_id, 30)

    db.execute(
        text("""
            MERGE dbo.AdherenceStats AS tgt
            USING (SELECT :uid AS user_id) AS s
            ON tgt.user_id = s.user_id
            WHEN MATCHED THEN
              UPDATE SET
                streak_days     = :streak,
                last_checkin_at = :now,
                avg_7d          = :avg7,
                avg_14d         = :avg14,
                avg_30d         = :avg30
            WHEN NOT MATCHED THEN
              INSERT (user_id, streak_days, last_checkin_at, avg_7d, avg_14d, avg_30d)
              VALUES (:uid, :streak, :now, :avg7, :avg14, :avg30);
        """),
        {"uid": user_id, "streak": streak, "now": now, "avg7": avg7, "avg14": avg14, "avg30": avg30},
    )
    db.commit()

    return CheckinResponse(
        saved=True,
        streak_days=streak,
        avg_7d=avg7,
        avg_14d=avg14,
        avg_30d=avg30,
    )
