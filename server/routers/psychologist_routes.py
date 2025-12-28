# server/routers/psychologist_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..deps import get_db
from .auth_routes import _user_id_from_authorization  # reuse your token extraction

router = APIRouter(prefix="/psy", tags=["psychologist"])


def _require_psychologist(user_id: str, db: Session):
    row = db.execute(
        text("SELECT TOP 1 user_id, Role FROM dbo.Users WHERE user_id = :uid"),
        {"uid": user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    if row.Role != "psychologist":
        raise HTTPException(status_code=403, detail="Psychologist access only")


@router.get("/clients")
def list_my_clients(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    _require_psychologist(user_id, db)

    rows = db.execute(
        text("""
            SELECT
                u.user_id,
                u.Username,
                u.Email,
                u.Age,
                u.Gender,
                COUNT(a.appointment_id) AS appointments_count,
                MAX(a.start_at) AS last_appointment_at
            FROM dbo.Appointments a
            JOIN dbo.Users u ON u.user_id = a.client_user_id
            WHERE a.psychologist_user_id = :psy
            GROUP BY u.user_id, u.Username, u.Email, u.Age, u.Gender
            ORDER BY u.Username ASC
        """),
        {"psy": user_id},
    ).fetchall()

    return [
        {
            "user_id": str(r.user_id),
            "username": r.Username,
            "email": r.Email,
            "age": r.Age,
            "gender": r.Gender,
            "appointments_count": int(r.appointments_count or 0),
            "last_appointment_at": r.last_appointment_at.isoformat() if r.last_appointment_at else None,
        }
        for r in rows
    ]


@router.get("/appointments")
def list_my_appointments(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    _require_psychologist(user_id, db)

    rows = db.execute(
        text("""
            SELECT
                a.appointment_id,
                a.client_user_id,
                u.Username AS client_username,
                u.Email    AS client_email,
                u.Age      AS client_age,
                u.Gender   AS client_gender,
                a.intake_id,
                i.answers_json,
                a.start_at,
                a.status,
                a.notes,
                a.created_at,
                a.updated_at
            FROM dbo.Appointments a
            JOIN dbo.Users u ON u.user_id = a.client_user_id
            LEFT JOIN dbo.AppointmentIntakes i ON i.intake_id = a.intake_id
            WHERE a.psychologist_user_id = :psy
            ORDER BY a.start_at DESC
        """),
        {"psy": user_id},
    ).fetchall()

    return [
        {
            "appointment_id": str(r.appointment_id),
            "client_user_id": str(r.client_user_id),
            "client_username": r.client_username,
            "client_email": r.client_email,
            "client_age": r.client_age,
            "client_gender": r.client_gender,
            "intake_id": str(r.intake_id) if r.intake_id else None,
            "intake_answers_json": r.answers_json,
            "start_at": r.start_at.isoformat() if r.start_at else None,
            "status": r.status,
            "notes": r.notes,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }
        for r in rows
    ]
