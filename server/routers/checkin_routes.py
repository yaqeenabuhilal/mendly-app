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


# ---------- Scoring helpers ----------

# same mapping as the dropdown in the React CheckInPage
LABEL_SCORES = {
    "anxious": 1,
    "stressed": 3,
    "tired": 5,
    "calm": 7,
    "excited": 9,
    "happy": 10,
}

# keyword rules for free-text "note" (you can extend this list any time)
# first match wins – order from strongest negative to strongest positive
KEYWORD_RULES = [
    # very low mood
    (["depressed", "miserable", "hopeless", "suicidal"], 1),
    # low / sad
    (["very sad", "so sad", "really sad"], 2),
    (["sad", "down", "crying", "lonely", "unhappy"], 3),
    # anxiety / stress
    (["panic attack", "panic"], 2),
    (["very anxious", "super anxious"], 2),
    (["anxious", "anxiety", "worried", "stressed", "overwhelmed"], 3),
    # tired / meh
    (["exhausted", "burnt out", "burned out"], 3),
    (["tired", "drained", "no energy"], 4),
    (["meh", "bored"], 5),
    # okay / calm
    (["fine", "okay", "ok", "calm"], 7),
    # positive
    (["good day", "feeling good"], 7),
    (["happy", "better", "grateful", "relieved"], 9),
    (["amazing", "fantastic", "great", "awesome", "wonderful"], 10),
]

def _normalize_text(s: Optional[str]) -> str:
  return (s or "").strip().lower()


def estimate_score_from_text(note: Optional[str]) -> Optional[int]:
    """
    Look for known keywords inside the note and return a score 1..10.
    If nothing matches, return None and let caller decide a default.
    """
    text = _normalize_text(note)
    if not text:
        return None

    for keywords, score in KEYWORD_RULES:
        if any(k in text for k in keywords):
            return score

    return None  # no keyword matched


def compute_final_score(payload: CheckinPayload) -> int:
    """
    Decide what score to save in the DB based on:
    1) explicit numeric score from frontend (emoji or list)
    2) label (dropdown string)
    3) free-text note keywords
    4) fallback = 5 (neutral) if nothing else found
    """
    # 1) numeric score from frontend (emoji or list)
    if payload.score is not None:
        return payload.score

    # 2) label from dropdown
    if payload.label:
        lbl = payload.label.strip().lower()
        if lbl in LABEL_SCORES:
            return LABEL_SCORES[lbl]

    # 3) free text – try to infer from keywords
    inferred = estimate_score_from_text(payload.note)
    if inferred is not None:
        return inferred

    # 4) fallback neutral
    return 5


# ---------- Streak / rolling average helpers ----------

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

    # 1) Decide which score to save
    score_to_save = compute_final_score(payload)

    label_to_save = payload.label or None
    note_to_save = payload.note or None  # str -> will convert to varbinary below

    # 2) pick emoji for that numeric score (for emojis_json)
    emoji_map = {
        1: "😞",
        3: "☹️",
        5: "😐",
        7: "🙂",
        9: "😊",
        10: "😁",
    }
    emoji_selected = emoji_map.get(score_to_save)
    emoji_json = (
        json.dumps({"selected": emoji_selected, "score": score_to_save})
        if emoji_selected
        else None
    )

    # 3) Insert into MoodEntries
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
            "note": note_to_save,      # None -> NULL, text -> VARBINARY
            "emoji_json": emoji_json,  # JSON string or NULL
            "ts": now,
        },
    )
    db.commit()

    # 4) Adherence stats
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
