# server/db.py
import os
import urllib.parse
from pathlib import Path

from dotenv import load_dotenv  # type: ignore
from sqlalchemy import create_engine  # type: ignore
from sqlalchemy.orm import sessionmaker, DeclarativeBase  # type: ignore

class Base(DeclarativeBase):
    pass

# Load the .env that sits in the *server/* folder
env_path = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=env_path, override=True)

DB_NAME = "Mendly"

odbc_str = os.getenv("DATABASE_URL_ODBC")
if not odbc_str:
    raise RuntimeError("DATABASE_URL_ODBC missing in server/.env")

parts = [p for p in odbc_str.split(";") if p.strip()]
parts = [p for p in parts if not p.lower().startswith("database=")]
parts.append(f"Database={DB_NAME}")
final_odbc = ";".join(parts)

params = urllib.parse.quote_plus(final_odbc)

engine = create_engine(
    f"mssql+pyodbc:///?odbc_connect={params}",
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
