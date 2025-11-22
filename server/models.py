# server/models.py
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    SmallInteger,
    DateTime,
    Boolean,
    DateTime,
    DateTime,
    DateTime,
    DateTime,
    DateTime,
)
from sqlalchemy import DateTime as DateTimeType
from sqlalchemy import Boolean as BooleanType
from sqlalchemy import SmallInteger as SmallIntegerType
from sqlalchemy import Integer as IntegerType
from sqlalchemy import String as StringType
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, DATETIMEOFFSET
from .db import Base

from sqlalchemy import Text
from sqlalchemy.sql import func, text

class User(Base):
    __tablename__ = "Users"

    user_id = Column(
        UNIQUEIDENTIFIER,
        primary_key=True,
        server_default=text("NEWSEQUENTIALID()"),
    )
    Firstname = Column(String(80), nullable=True)
    Lastname = Column(String(80), nullable=True)
    Username = Column(String(120), nullable=True, unique=True)
    Password = Column(String(256), nullable=True)  # hashed password
    Age = Column(SmallIntegerType, nullable=True)
    Gender = Column(SmallIntegerType, nullable=True)  # 0=NA,1=F,2=M,3=Other
    is_deleted = Column(BooleanType, nullable=False, server_default=text("0"))
    created_at = Column(DATETIMEOFFSET, nullable=False, server_default=text("SYSDATETIMEOFFSET()"))
    updated_at = Column(DATETIMEOFFSET, nullable=False, server_default=text("SYSDATETIMEOFFSET()"))


class UserDeviceToken(Base):
    __tablename__ = "UserDeviceTokens"

    token_id = Column(
        UNIQUEIDENTIFIER,
        primary_key=True,
        server_default=text("NEWSEQUENTIALID()"),
    )
    user_id = Column(UNIQUEIDENTIFIER, nullable=False)
    platform = Column(String(20), nullable=False)  # 'android' / 'ios'
    fcm_token = Column(String(512), nullable=False, unique=True)
    app_version = Column(String(20))
    last_seen = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.sysdatetimeoffset(),
    )
    is_active = Column(Boolean, nullable=False, server_default=text("1"))


class NotificationQueue(Base):
    __tablename__ = "NotificationQueue"

    job_id = Column(
        UNIQUEIDENTIFIER,
        primary_key=True,
        server_default=text("NEWSEQUENTIALID()"),
    )
    user_id = Column(UNIQUEIDENTIFIER, nullable=False)
    token_id = Column(UNIQUEIDENTIFIER)  # optional, we may leave NULL
    purpose = Column(String(40), nullable=False)  # 'checkin_reminder', etc.
    payload_json = Column(Text, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    sent_at = Column(DateTime(timezone=True))
    status = Column(String(20), nullable=False, server_default=text("N'pending'"))
    error = Column(String(500))