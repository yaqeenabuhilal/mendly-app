from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..deps import get_db
from ..schemas import UserSettingsPublic, MoodDaySummary   # ⬅️ no JourneyOverview here
from .auth_routes import _user_id_from_authorization

router = APIRouter(prefix="/journey", tags=["journey"])

def _iso(d) -> str:
    # SQL Server returns date objects; normalize to YYYY-MM-DD
    return d.strftime("%Y-%m-%d")

# ⬇️ REMOVE response_model so extra fields aren't dropped
@router.get("/overview")
def get_journey_overview(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    # 1) Load or create UserSettings
    row_settings = db.execute(
        text("""
            SELECT TOP 1 checkin_frequency, motivation_enabled
            FROM dbo.UserSettings
            WHERE user_id = :uid
        """),
        {"uid": user_id}
    ).fetchone()

    if not row_settings:
        db.execute(text("INSERT INTO dbo.UserSettings (user_id) VALUES (:uid)"), {"uid": user_id})
        db.commit()
        row_settings = db.execute(
            text("""
                SELECT TOP 1 checkin_frequency, motivation_enabled
                FROM dbo.UserSettings
                WHERE user_id = :uid
            """),
            {"uid": user_id}
        ).fetchone()

    if not row_settings:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to load user settings")

    settings = UserSettingsPublic(
        checkin_frequency=int(row_settings.checkin_frequency),
        motivation_enabled=bool(row_settings.motivation_enabled),
    )

    # 2) Mood summary for last 7 days
    start_dt = datetime.now(timezone.utc) - timedelta(days=7)
    rows_mood = db.execute(
        text("""
            SELECT
                CAST(captured_at AS date) AS d,
                AVG(CAST(score AS float)) AS avg_score,
                COUNT(*) AS entries_count
            FROM dbo.MoodEntries
            WHERE user_id = :uid
              AND captured_at >= :start_dt
            GROUP BY CAST(captured_at AS date)
            ORDER BY d
        """),
        {"uid": user_id, "start_dt": start_dt}
    ).fetchall()

    last7days: List[MoodDaySummary] = []
    for r in rows_mood:
        d_val = r.d.date() if hasattr(r.d, "date") else r.d
        last7days.append(
            MoodDaySummary(
                date=d_val,
                avg_score=float(r.avg_score) if r.avg_score is not None else 0.0,
                entries_count=int(r.entries_count),
            )
        )

    # 3) Adherence stats
    stats = db.execute(
        text("""
            SELECT streak_days, last_checkin_at, avg_7d, avg_14d, avg_30d
            FROM dbo.AdherenceStats WHERE user_id = :uid
        """),
        {"uid": user_id}
    ).mappings().first() or {}

    # 4) Today activity
    today = db.execute(
        text("""
            SELECT
              COUNT(*) AS checkins_today,
              AVG(CAST(score AS float)) AS avg_today
            FROM dbo.MoodEntries
            WHERE user_id = :uid
              AND CAST(captured_at AS date) = CAST(SYSDATETIMEOFFSET() AS date)
        """),
        {"uid": user_id}
    ).mappings().first() or {"checkins_today": 0, "avg_today": None}

    # 5) Schedule (enabled only)
    sched = db.execute(
        text("""
            SELECT slot_name, local_hour, local_minute
            FROM dbo.CheckinSchedule
            WHERE user_id = :uid AND enabled = 1
            ORDER BY CASE slot_name WHEN N'morning' THEN 0 WHEN N'noon' THEN 1 ELSE 2 END
        """),
        {"uid": user_id}
    ).mappings().all()

    # 6) Top labels (14d)
    labels = db.execute(
        text("""
            SELECT TOP 6 label, COUNT(*) AS cnt
            FROM dbo.MoodEntries
            WHERE user_id = :uid
              AND label IS NOT NULL
              AND captured_at >= DATEADD(DAY, -14, SYSDATETIMEOFFSET())
            GROUP BY label
            ORDER BY cnt DESC
        """),
        {"uid": user_id}
    ).mappings().all()

    # 7) Recent recommendations
    recs = db.execute(
        text("""
            SELECT TOP 3 rec_id, rec_type, title, user_action, shown_at
            FROM dbo.Recommendations
            WHERE user_id = :uid
            ORDER BY shown_at DESC
        """),
        {"uid": user_id}
    ).mappings().all()

    # 8) Latest AI weekly summary
    ai_summary = db.execute(
        text("""
            SELECT TOP 1 output_text, created_at
            FROM dbo.AIInteractions
            WHERE user_id = :uid AND purpose = N'summary'
            ORDER BY created_at DESC
        """),
        {"uid": user_id}
    ).mappings().first()

    # Return everything; FE already reads extra fields via (data as any)
    return {
        "settings": settings,
        "last7days": last7days,
        "adherence": {
            "streak_days": stats.get("streak_days", 0),
            "avg_7d": stats.get("avg_7d"),
            "avg_14d": stats.get("avg_14d"),
            "avg_30d": stats.get("avg_30d"),
            "last_checkin_at": stats.get("last_checkin_at"),
        },
        "today": {
            "checkins": int(today["checkins_today"] or 0),
            "avg": float(today["avg_today"]) if today["avg_today"] is not None else None,
        },
        "schedule": [
            {"slot": s["slot_name"], "h": int(s["local_hour"]), "m": int(s["local_minute"])}
            for s in sched
        ],
        "top_labels": [{"label": r["label"], "count": int(r["cnt"])} for r in labels],
        "recent_recs": [
            {"rec_id": str(r["rec_id"]), "rec_type": r["rec_type"], "title": r["title"], "user_action": r["user_action"]}
            for r in recs
        ],
        "ai_summary": (
            {"created_at": ai_summary["created_at"], "text": ai_summary["output_text"]}
            if ai_summary else None
        ),
    }

@router.get("/series")
def mood_series(
    days: int = Query(7, ge=1, le=90),
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    """
    Returns EXACT last `days` days including today: [{date:'YYYY-MM-DD', avg_score: number|null}, ...]
    """
    # Build a date ladder in SQL Server (recursive CTE), last N days including today
    # We join per-day to MoodEntries for the current user and average scores.
    sql = text(f"""
        WITH Today AS (
            SELECT CONVERT(date, SYSDATETIMEOFFSET()) AS d0
        ),
        Dates AS (
            SELECT d0 AS d, 0 AS step FROM Today
            UNION ALL
            SELECT DATEADD(day, -1, d), step + 1 FROM Dates
            WHERE step + 1 < :days
        )
        SELECT 
            CONVERT(varchar(10), d, 23) AS d,
            AVG(CAST(me.score AS float)) AS avg_score
        FROM Dates
        LEFT JOIN dbo.MoodEntries AS me
          ON CONVERT(date, me.captured_at) = d
         AND me.user_id = :uid
        GROUP BY d
        ORDER BY d ASC
        OPTION (MAXRECURSION 0);
    """)
    rows = db.execute(sql, {"days": days, "uid": user_id}).fetchall()
    return [{"date": r.d, "avg_score": (float(r.avg_score) if r.avg_score is not None else None)} for r in rows]