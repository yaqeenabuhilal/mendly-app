from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from server.utils.email import send_email
import json

from ..deps import get_db
from .auth_routes import _user_id_from_authorization

router = APIRouter(prefix="/appointments", tags=["appointments"])


# ===================== Models =====================

class IntakeCreate(BaseModel):
    psychologist_user_id: str
    answers: Dict[str, Any]


class IntakePublic(BaseModel):
    intake_id: str
    client_user_id: str
    psychologist_user_id: str
    answers_json: str
    created_at: str


class AppointmentCreate(BaseModel):
    psychologist_user_id: str
    intake_id: Optional[str] = None
    start_at: str  # ISO string (DATETIMEOFFSET)


class AppointmentPublic(BaseModel):
    appointment_id: str

    client_user_id: str
    client_username: Optional[str] = None
    client_email: Optional[str] = None

    psychologist_user_id: str
    intake_id: Optional[str]

    start_at: str
    status: str
    notes: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str  # approved/rejected/canceled/completed
    notes: Optional[str] = None


# ===================== Helpers =====================

def _get_role(db: Session, user_id: str) -> str:
    row = db.execute(
        text("SELECT TOP 1 Role FROM dbo.Users WHERE user_id = :uid"),
        {"uid": user_id},
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return row.Role


# ===================== (A) Create Intake =====================
@router.post("/intake", response_model=IntakePublic)
def create_intake(
    payload: IntakeCreate,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    role = _get_role(db, user_id)
    if role != "regular":
        raise HTTPException(status_code=403, detail="Only regular users can create intake")

    db.execute(
        text("""
            INSERT INTO dbo.AppointmentIntakes (client_user_id, psychologist_user_id, answers_json)
            VALUES (:client_id, :psy_id, :answers_json)
        """),
        {
            "client_id": user_id,
            "psy_id": payload.psychologist_user_id,
            "answers_json": json.dumps(payload.answers, ensure_ascii=False),
        },
    )
    db.commit()

    row = db.execute(
        text("""
            SELECT TOP 1 intake_id, client_user_id, psychologist_user_id, answers_json, created_at
            FROM dbo.AppointmentIntakes
            WHERE client_user_id = :client_id AND psychologist_user_id = :psy_id
            ORDER BY created_at DESC
        """),
        {"client_id": user_id, "psy_id": payload.psychologist_user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=500, detail="Intake created but not found")

    return IntakePublic(
        intake_id=str(row.intake_id),
        client_user_id=str(row.client_user_id),
        psychologist_user_id=str(row.psychologist_user_id),
        answers_json=row.answers_json,
        created_at=str(row.created_at),
    )


# ===================== (B) Create Appointment =====================
@router.post("", response_model=AppointmentPublic)
def create_appointment(
    payload: AppointmentCreate,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    role = _get_role(db, user_id)
    if role != "regular":
        raise HTTPException(status_code=403, detail="Only regular users can request appointments")

    # validate intake belongs to client + same psychologist
    if payload.intake_id:
        chk = db.execute(
            text("""
                SELECT TOP 1 intake_id
                FROM dbo.AppointmentIntakes
                WHERE intake_id = :iid AND client_user_id = :cid AND psychologist_user_id = :pid
            """),
            {"iid": payload.intake_id, "cid": user_id, "pid": payload.psychologist_user_id},
        ).fetchone()
        if not chk:
            raise HTTPException(status_code=400, detail="Invalid intake_id for this user/psychologist")

    db.execute(
        text("""
            INSERT INTO dbo.Appointments
            (client_user_id, psychologist_user_id, intake_id, start_at, status)
            VALUES (:client_id, :psy_id, :intake_id, :start_at, 'requested')
        """),
        {
            "client_id": user_id,
            "psy_id": payload.psychologist_user_id,
            "intake_id": payload.intake_id,
            "start_at": payload.start_at,
        },
    )
    db.commit()

    row = db.execute(
        text("""
            SELECT TOP 1
                a.appointment_id, a.client_user_id, a.psychologist_user_id, a.intake_id,
                a.start_at, a.status, a.notes, a.created_at, a.updated_at,
                u.Username AS client_username, u.Email AS client_email
            FROM dbo.Appointments a
            JOIN dbo.Users u ON u.user_id = a.client_user_id
            WHERE a.client_user_id = :client_id AND a.psychologist_user_id = :psy_id
            ORDER BY a.created_at DESC
        """),
        {"client_id": user_id, "psy_id": payload.psychologist_user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=500, detail="Appointment created but not found")

    return AppointmentPublic(
        appointment_id=str(row.appointment_id),
        client_user_id=str(row.client_user_id),
        client_username=row.client_username,
        client_email=row.client_email,
        psychologist_user_id=str(row.psychologist_user_id),
        intake_id=str(row.intake_id) if row.intake_id else None,
        start_at=str(row.start_at),
        status=row.status,
        notes=row.notes,
        created_at=str(row.created_at),
        updated_at=str(row.updated_at) if row.updated_at else None,
    )


# ===================== (C) Psychologist: list requests =====================
@router.get("/psy", response_model=List[AppointmentPublic])
def list_psy_appointments(
    status_filter: Optional[str] = None,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    role = _get_role(db, user_id)
    if role != "psychologist":
        raise HTTPException(status_code=403, detail="Only psychologists can view this")

    q = """
        SELECT
            a.appointment_id,
            a.client_user_id,
            a.psychologist_user_id,
            a.intake_id,
            a.start_at,
            a.status,
            a.notes,
            a.created_at,
            a.updated_at,
            u.Username AS client_username,
            u.Email AS client_email
        FROM dbo.Appointments a
        JOIN dbo.Users u
            ON u.user_id = a.client_user_id
        WHERE a.psychologist_user_id = :pid
    """
    params = {"pid": user_id}

    if status_filter:
        q += " AND a.status = :st"
        params["st"] = status_filter

    q += " ORDER BY a.created_at DESC"

    rows = db.execute(text(q), params).fetchall()

    return [
        AppointmentPublic(
            appointment_id=str(r.appointment_id),
            client_user_id=str(r.client_user_id),
            client_username=r.client_username,
            client_email=r.client_email,
            psychologist_user_id=str(r.psychologist_user_id),
            intake_id=str(r.intake_id) if r.intake_id else None,
            start_at=str(r.start_at),
            status=r.status,
            notes=r.notes,
            created_at=str(r.created_at),
            updated_at=str(r.updated_at) if r.updated_at else None,
        )
        for r in rows
    ]


# ===================== (D) Psychologist: view intake answers =====================
@router.get("/intake/{intake_id}", response_model=IntakePublic)
def get_intake(
    intake_id: str,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    role = _get_role(db, user_id)
    if role != "psychologist":
        raise HTTPException(status_code=403, detail="Only psychologists can view intakes")

    row = db.execute(
        text("""
            SELECT TOP 1 intake_id, client_user_id, psychologist_user_id, answers_json, created_at
            FROM dbo.AppointmentIntakes
            WHERE intake_id = :iid AND psychologist_user_id = :pid
        """),
        {"iid": intake_id, "pid": user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Intake not found")

    return IntakePublic(
        intake_id=str(row.intake_id),
        client_user_id=str(row.client_user_id),
        psychologist_user_id=str(row.psychologist_user_id),
        answers_json=row.answers_json,
        created_at=str(row.created_at),
    )


# ===================== (E) Psychologist: approve/reject =====================
@router.put("/{appointment_id}/status", response_model=AppointmentPublic)
def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    role = _get_role(db, user_id)
    if role != "psychologist":
        raise HTTPException(status_code=403, detail="Only psychologists can update status")

    allowed = {"approved", "rejected", "canceled", "completed"}
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {sorted(allowed)}")

    # update appointment
    db.execute(
        text("""
            UPDATE dbo.Appointments
            SET status = :st,
                notes = :notes,
                updated_at = SYSDATETIMEOFFSET()
            WHERE appointment_id = :aid AND psychologist_user_id = :pid
        """),
        {"st": payload.status, "notes": payload.notes, "aid": appointment_id, "pid": user_id},
    )
    db.commit()

    # reload appointment + client info
    row = db.execute(
        text("""
            SELECT TOP 1
                a.appointment_id, a.client_user_id, a.psychologist_user_id, a.intake_id,
                a.start_at, a.status, a.notes, a.created_at, a.updated_at,
                u.Username AS client_username, u.Email AS client_email
            FROM dbo.Appointments a
            JOIN dbo.Users u ON u.user_id = a.client_user_id
            WHERE a.appointment_id = :aid
        """),
        {"aid": appointment_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # ===== send email =====
    if payload.status in {"approved", "rejected"} and row.client_email:
        if payload.status == "approved":
            subject = "Your appointment has been approved"
            body = f"""Hello {row.client_username},

Your appointment request has been APPROVED.

Scheduled time:
{row.start_at}

Best regards,
Mendly Team
"""
        else:
            subject = "Your appointment request was declined"
            body = f"""Hello {row.client_username},

Unfortunately, your appointment request was DECLINED.

You may request another appointment.

Best regards,
Mendly Team
"""

        send_email(row.client_email, subject, body)

    return AppointmentPublic(
        appointment_id=str(row.appointment_id),
        client_user_id=str(row.client_user_id),
        client_username=row.client_username,
        client_email=row.client_email,
        psychologist_user_id=str(row.psychologist_user_id),
        intake_id=str(row.intake_id) if row.intake_id else None,
        start_at=str(row.start_at),
        status=row.status,
        notes=row.notes,
        created_at=str(row.created_at),
        updated_at=str(row.updated_at) if row.updated_at else None,
    )
