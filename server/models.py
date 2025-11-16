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
from sqlalchemy import text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, DATETIMEOFFSET
from .db import Base


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
