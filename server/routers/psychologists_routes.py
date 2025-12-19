from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional,List

from ..deps import get_db
from .auth_routes import _user_id_from_authorization

router = APIRouter(prefix="", tags=["psychologists"])

class PsychologistPublic(BaseModel):
    user_id: str
    username: str
    email: str
    specialty: Optional[str] = None
    workplace: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    years_experience: Optional[int] = None
    license_number: Optional[str] = None


@router.get("/psychologists", response_model=List[PsychologistPublic])
def list_psychologists(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
            SELECT
                u.user_id,
                u.Username,
                u.Email,
                p.specialty,
                p.workplace,
                p.city,
                p.bio,
                p.years_experience,
                p.license_number
            FROM dbo.Users u
            LEFT JOIN dbo.PsychologistProfiles p
                ON p.user_id = u.user_id
            WHERE u.Role = 'psychologist'
            ORDER BY u.Username
        """)
    ).fetchall()

    return [
        PsychologistPublic(
            user_id=str(r.user_id),
            username=r.Username,
            email=r.Email,
            specialty=r.specialty,
            workplace=r.workplace,
            city=r.city,
            bio=r.bio,
            years_experience=r.years_experience,
            license_number=r.license_number,
        )
        for r in rows
    ]

class PsychologistProfileUpdate(BaseModel):
    specialty: str
    workplace: str
    city: str
    bio: str
    years_experience: Optional[int] = None
    license_number: Optional[str] = None


@router.put("/psychologist-profile")
def update_psychologist_profile(
    payload: PsychologistProfileUpdate,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    # ensure user is psychologist (optional but recommended)
    user = db.execute(
        text("""
            SELECT TOP 1 Role
            FROM dbo.Users
            WHERE user_id = :uid
        """),
        {"uid": user_id},
    ).fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.Role != "psychologist":
        raise HTTPException(status_code=403, detail="Not a psychologist account")

    # check existing profile
    existing = db.execute(
        text("""
            SELECT TOP 1 user_id
            FROM dbo.PsychologistProfiles
            WHERE user_id = :uid
        """),
        {"uid": user_id},
    ).fetchone()

    if existing:
        db.execute(
            text("""
                UPDATE dbo.PsychologistProfiles
                SET specialty = :specialty,
                    workplace = :workplace,
                    city = :city,
                    bio = :bio,
                    years_experience = :years_experience,
                    license_number = :license_number
                WHERE user_id = :uid
            """),
            {
                "uid": user_id,
                "specialty": payload.specialty,
                "workplace": payload.workplace,
                "city": payload.city,
                "bio": payload.bio,
                "years_experience": payload.years_experience,
                "license_number": payload.license_number,
            },
        )
    else:
        db.execute(
            text("""
                INSERT INTO dbo.PsychologistProfiles
                (user_id, specialty, workplace, city, bio, years_experience, license_number)
                VALUES (:uid, :specialty, :workplace, :city, :bio, :years_experience, :license_number)
            """),
            {
                "uid": user_id,
                "specialty": payload.specialty,
                "workplace": payload.workplace,
                "city": payload.city,
                "bio": payload.bio,
                "years_experience": payload.years_experience,
                "license_number": payload.license_number,
            },
        )

    db.commit()
    return {"ok": True}

@router.get("/psychologists/{user_id}", response_model=PsychologistPublic)
def get_psychologist(user_id: str, db: Session = Depends(get_db)):
    row = db.execute(
        text("""
            SELECT TOP 1
                u.user_id,
                u.Username,
                u.Email,
                p.specialty,
                p.workplace,
                p.city,
                p.bio,
                p.years_experience,
                p.license_number
            FROM dbo.Users u
            LEFT JOIN dbo.PsychologistProfiles p
                ON p.user_id = u.user_id
            WHERE u.Role = 'psychologist'
              AND u.user_id = :uid
        """),
        {"uid": user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Psychologist not found")

    return PsychologistPublic(
        user_id=str(row.user_id),
        username=row.Username,
        email=row.Email,
        specialty=row.specialty,
        workplace=row.workplace,
        city=row.city,
        bio=row.bio,
        years_experience=row.years_experience,
        license_number=row.license_number,
    )
