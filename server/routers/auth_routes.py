# server/routers/auth_routes.py
import os
import smtplib
import secrets
import string
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status, Header
from jose import JWTError, jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..deps import get_db
from ..auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from ..schemas import (
    UserCreate,
    UserLogin,
    UserPublic,
    Token,
    ForgotPasswordStart,
    ForgotPasswordVerify,
    UserUpdate,
    ChangePassword,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# ================== SIGNUP ==================
@router.post("/signup", response_model=UserPublic)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    # 1) Check if username or email already exist
    existing = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Username, Email, Age, Gender
            FROM dbo.Users
            WHERE Username = :username OR Email = :email
        """
        ),
        {"username": payload.username, "email": payload.email},
    ).fetchone()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already in use",
        )

    # 2) INSERT without user_id – let DEFAULT NEWSEQUENTIALID() handle it
    db.execute(
        text(
            """
            INSERT INTO dbo.Users (Username, Email, Password, Age, Gender)
            VALUES (:username, :email, :password, :age, :gender)
        """
        ),
        {
            "username": payload.username,
            "email": payload.email,
            "password": hash_password(payload.password),
            "age": payload.age,
            "gender": payload.gender,
        },
    )
    db.commit()

    # 3) Fetch the created user to return as UserPublic
    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Username, Email, Age, Gender
            FROM dbo.Users
            WHERE Username = :username
        """
        ),
        {"username": payload.username},
    ).fetchone()

    return UserPublic(
        user_id=str(row.user_id),
        username=row.Username,
        email=row.Email,
        age=row.Age,
        gender=row.Gender,
    )


# ================== LOGIN ==================
@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Username, Email, Password
            FROM dbo.Users
            WHERE Username = :username
        """
        ),
        {"username": payload.username},
    ).fetchone()

    if not row or not verify_password(payload.password, row.Password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # IMPORTANT: sub = user_id
    access_token = create_access_token(
        {"sub": str(row.user_id), "username": row.Username}
    )
    return Token(access_token=access_token)


# ================== FORGOT PASSWORD (email + code) ==================

RESET_CODES: Dict[str, Dict[str, object]] = {}


def generate_reset_code() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))


def send_reset_email(to_email: str, code: str) -> None:
    email_user = os.getenv("EMAIL")
    email_pass = os.getenv("EMAILPASSWORD")

    if not email_user or not email_pass:
        print("[email] EMAIL or EMAILPASSWORD missing in .env")
        return

    msg = EmailMessage()
    msg["Subject"] = "Mendly – Password Reset Code"
    msg["From"] = email_user
    msg["To"] = to_email
    msg.set_content(
        f"Your Mendly password reset code is: {code}\n\n"
        "This code is valid for 10 minutes."
    )

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(email_user, email_pass)
            server.send_message(msg)
        print(f"[email] Reset code sent to {to_email}")
    except Exception as e:
        print("[email] Failed to send email:", e)


@router.post("/forgot-password/start")
def forgot_password_start(
    payload: ForgotPasswordStart, db: Session = Depends(get_db)
):
    email = payload.email.lower()

    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id
            FROM dbo.Users
            WHERE Email = :email
        """
        ),
        {"email": email},
    ).fetchone()

    # Always respond OK for security
    if not row:
        print(f"[forgot-password] No user with email {email}, but returning OK.")
        return {"ok": True, "message": "If this email is registered, a code was sent."}

    code = generate_reset_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    RESET_CODES[email] = {"code": code, "expires_at": expires_at}

    send_reset_email(email, code)

    return {"ok": True, "message": "If this email is registered, a code was sent."}


@router.post("/forgot-password/verify")
def forgot_password_verify(
    payload: ForgotPasswordVerify, db: Session = Depends(get_db)
):
    email = payload.email.lower()
    entry = RESET_CODES.get(email)

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired code.",
        )

    stored_code = entry["code"]
    expires_at = entry["expires_at"]

    if not isinstance(stored_code, str) or not isinstance(expires_at, datetime):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired code.",
        )

    if datetime.now(timezone.utc) > expires_at:
        RESET_CODES.pop(email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code expired. Please request a new one.",
        )

    if payload.code != stored_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect code. Please try again.",
        )

    db.execute(
        text(
            """
            UPDATE dbo.Users
            SET Password = :new_password
            WHERE Email = :email
        """
        ),
        {
            "email": email,
            "new_password": hash_password(payload.new_password),
        },
    )
    db.commit()
    RESET_CODES.pop(email, None)

    return {"ok": True, "message": "Password updated successfully."}


# ================== /auth/me (PROFILE) ==================

JWT_SECRET = os.getenv("JWT_SECRET", "change_me_very_secret")
JWT_ALG = "HS256"


def _user_id_from_authorization(authorization: str = Header(...)) -> str:
    """
    Extract user_id from the Bearer token in Authorization header.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    return str(sub)


@router.get("/me", response_model=UserPublic)
def get_me(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Username, Email, Age, Gender
            FROM dbo.Users
            WHERE user_id = :uid
        """
        ),
        {"uid": user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    return UserPublic(
        user_id=str(row.user_id),
        username=row.Username,
        email=row.Email,
        age=row.Age,
        gender=row.Gender,
    )


@router.put("/me", response_model=UserPublic)
def update_me(
    payload: UserUpdate,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    # Frontend always sends username, email, age, gender
    db.execute(
        text(
            """
            UPDATE dbo.Users
            SET Username = :username,
                Email    = :email,
                Age      = :age,
                Gender   = :gender,
                updated_at = SYSDATETIMEOFFSET()
            WHERE user_id = :uid
        """
        ),
        {
            "username": payload.username,
            "email": payload.email,
            "age": payload.age,
            "gender": payload.gender,
            "uid": user_id,
        },
    )
    db.commit()

    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Username, Email, Age, Gender
            FROM dbo.Users
            WHERE user_id = :uid
        """
        ),
        {"uid": user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found after update")

    return UserPublic(
        user_id=str(row.user_id),
        username=row.Username,
        email=row.Email,
        age=row.Age,
        gender=row.Gender,
    )


# ================== CHANGE PASSWORD (PROFILE) ==================

@router.post("/change-password")
def change_password(
    payload: ChangePassword,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    current_user is loaded via JWT (sub = user_id) using get_current_user.
    """
    # 1) Load current hash for safety (or you could use current_user.Password if you
    #    include Password in get_user_by_id).
    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Password
            FROM dbo.Users
            WHERE user_id = :uid
            """
        ),
        {"uid": current_user.user_id},
    ).fetchone()

    if not row or not verify_password(payload.current_password, row.Password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # 2) Update password
    db.execute(
        text(
            """
            UPDATE dbo.Users
            SET Password = :new_password,
                updated_at = SYSDATETIMEOFFSET()
            WHERE user_id = :uid
        """
        ),
        {
            "uid": current_user.user_id,
            "new_password": hash_password(payload.new_password),
        },
    )
    db.commit()

    return {"ok": True, "message": "Password updated successfully."}
