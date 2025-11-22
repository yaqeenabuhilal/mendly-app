# server/schemas.py
from typing import Optional
from pydantic import BaseModel, constr, Field, EmailStr
from datetime import date
from typing import List

UsernameStr = constr(min_length=3, max_length=120)
PasswordStr = constr(min_length=6, max_length=128)


class UserBase(BaseModel):
    username: UsernameStr  # type: ignore
    email: EmailStr
    age: Optional[int] = Field(default=None, ge=10, le=120)
    gender: Optional[int] = Field(default=0, ge=0, le=3)  # 0=NA,1=F,2=M,3=Other


class UserCreate(UserBase):
    password: PasswordStr  # type: ignore


class UserLogin(BaseModel):
    username: UsernameStr  # type: ignore
    password: PasswordStr  # type: ignore


# Forgot-password (email + code + new password)
class ForgotPasswordStart(BaseModel):
    email: EmailStr


class ForgotPasswordVerify(BaseModel):
    email: EmailStr
    code: constr(min_length=4, max_length=10)  # type: ignore
    new_password: PasswordStr  # type: ignore


# Used for updating profile
class UserUpdate(BaseModel):
    # In your frontend you always send these, so they can be required:
    username: UsernameStr  # type: ignore
    email: EmailStr
    age: Optional[int] = Field(default=None, ge=10, le=120)
    gender: Optional[int] = Field(default=None, ge=0, le=3)


class UserPublic(BaseModel):
    user_id: str
    username: str
    email: str
    age: Optional[int]
    gender: Optional[int]

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChangePassword(BaseModel):
    current_password: PasswordStr  # type: ignore
    new_password: PasswordStr      # type: ignore


class UserSettingsPublic(BaseModel):
    checkin_frequency: int
    motivation_enabled: bool


class MoodDaySummary(BaseModel):
    date: date
    avg_score: float
    entries_count: int


class JourneyOverview(BaseModel):
    settings: UserSettingsPublic
    last7days: List[MoodDaySummary]


class DeviceRegister(BaseModel):
    fcm_token: str
    platform: str  # 'android' or 'ios'
    app_version: Optional[str] = None