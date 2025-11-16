# server/auth.py
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import jwt, JWTError  # type: ignore
from passlib.context import CryptContext  # type: ignore
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import text  # <-- use raw SQL, no ORM columns

from .deps import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Read from .env
SECRET_KEY = os.getenv("JWT_SECRET", "change_me_very_secret")
ALGORITHM = "HS256"
TOKEN_EXPIRES_RAW = os.getenv("TOKEN_EXPIRES", "7d")

# parse "7d" -> 7
try:
    if TOKEN_EXPIRES_RAW.endswith("d"):
        ACCESS_TOKEN_EXPIRE_DAYS = int(TOKEN_EXPIRES_RAW[:-1])
    else:
        ACCESS_TOKEN_EXPIRE_DAYS = int(TOKEN_EXPIRES_RAW)
except Exception:
    ACCESS_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT. Expect 'sub' = user_id and any extra claims (e.g., 'username', 'is_admin').
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_access_token_for_user(row: Any, expires_delta: Optional[timedelta] = None) -> str:
    """
    Convenience helper: build standard claims from a Users row.
    - sub: user_id (GUID)
    - username: Username
    - is_admin: bit -> bool
    """
    return create_access_token(
        {
            "sub": str(row.user_id),
            "username": row.Username,
            "is_admin": bool(getattr(row, "is_admin", False)),
        },
        expires_delta=expires_delta,
    )


# ========= USER LOOKUPS USING RAW SQL (no Firstname/Lastname) =========

def get_user_by_username(db: Session, username: str) -> Optional[Any]:
    """
    Return a row from dbo.Users by Username, or None.
    """
    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Username, Email, Password, Age, Gender, is_deleted, is_admin
            FROM dbo.Users
            WHERE Username = :username AND is_deleted = 0
            """
        ),
        {"username": username},
    ).fetchone()
    return row


def get_user_by_id(db: Session, user_id: str) -> Optional[Any]:
    """
    Return a row from dbo.Users by user_id, or None.
    """
    row = db.execute(
        text(
            """
            SELECT TOP 1 user_id, Username, Email, Password, Age, Gender, is_deleted, is_admin
            FROM dbo.Users
            WHERE user_id = :uid AND is_deleted = 0
            """
        ),
        {"uid": user_id},
    ).fetchone()
    return row


def authenticate_user(db: Session, username: str, password: str) -> Optional[Any]:
    """
    Optional helper if you ever want to do username+password auth here.
    Uses the raw SQL row, not the ORM model.
    """
    user = get_user_by_username(db, username)
    if not user or not user.Password:
        return None
    if not verify_password(password, user.Password):
        return None
    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Any:
    """
    Decode JWT, read 'sub' as user_id (GUID), and load that user from dbo.Users.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")  # type: ignore[assignment]
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception

    return user


# ===== 1.a Auth helpers (admin gating) =====

async def get_current_admin(
    current_user: Any = Depends(get_current_user),
) -> Any:
    """
    Dependency to protect admin-only routes.
    Returns the user if they are admin; otherwise raises 403.
    """
    # Prefer DB truth. If you also include is_admin in JWT, you could short-circuit here,
    # but DB is the source of truth to prevent privilege escalation.
    if not bool(getattr(current_user, "is_admin", False)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin only",
        )
    return current_user
