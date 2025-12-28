# server/init_db.py
from pathlib import Path
import os
import re
import urllib.parse

from dotenv import load_dotenv  # type: ignore
from sqlalchemy import create_engine, text  # type: ignore

# Load .env NEXT TO THIS FILE  -> Mendly/server/.env
env_path = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=env_path, override=True)

DB_NAME = "Mendly"
SCHEMA_FILE = Path(__file__).with_name("mendly_schema.sql")


def _build_master_engine():
    """
    Connect to SQL Server 'master' so we can CREATE DATABASE Mendly.
    Must be AUTOCOMMIT for CREATE DATABASE.
    """
    odbc_str = os.getenv("DATABASE_URL_ODBC")
    if not odbc_str:
        raise RuntimeError("DATABASE_URL_ODBC missing in server/.env")

    parts = [p for p in odbc_str.split(";") if p.strip()]
    parts = [p for p in parts if not p.lower().startswith("database=")]
    parts.append("Database=master")
    master_odbc = ";".join(parts)

    params = urllib.parse.quote_plus(master_odbc)
    return create_engine(
        f"mssql+pyodbc:///?odbc_connect={params}",
        pool_pre_ping=True,
        future=True,
        isolation_level="AUTOCOMMIT",
    )


def _run_sql_with_go(conn, sql_text: str) -> None:
    """
    SQLAlchemy/pyodbc cannot understand SSMS 'GO'.
    Split into batches on lines that contain only GO.
    """
    batches = re.split(r"^\s*GO\s*$", sql_text, flags=re.IGNORECASE | re.MULTILINE)
    for batch in batches:
        stmt = batch.strip()
        if stmt:
            conn.exec_driver_sql(stmt)


def ensure_database_and_schema():
    """
    1) Ensure Mendly DB exists.
    2) Apply schema file (GO-aware).
       Skip only if dbo.Users exists and dbo.Users.Role exists (mode=missing).
    """
    print("[init_db] starting...")

    # 1) Create DB if needed (master, AUTOCOMMIT)
    master_engine = _build_master_engine()
    with master_engine.connect() as conn:
        conn.execute(text(f"IF DB_ID(N'{DB_NAME}') IS NULL CREATE DATABASE {DB_NAME};"))
        print("[init_db] DB ensured:", DB_NAME)

    # 2) Connect to Mendly with normal engine
    from .db import engine

    if not SCHEMA_FILE.exists():
        raise RuntimeError(f"[init_db] schema file not found: {SCHEMA_FILE}")

    mode = (os.getenv("INIT_DB_MODE") or "missing").lower().strip()

    with engine.begin() as conn:
        current_db = conn.execute(text("SELECT DB_NAME()")).scalar_one()
        print("[init_db] connected to:", current_db)

        if str(current_db).lower() != DB_NAME.lower():
            raise RuntimeError(f"[init_db] Engine connected to '{current_db}', expected '{DB_NAME}'.")

        if mode != "always":
            users_exists = conn.execute(text("SELECT OBJECT_ID('dbo.Users','U')")).scalar_one()
            role_exists = conn.execute(text("SELECT COL_LENGTH('dbo.Users','Role')")).scalar_one()
            if users_exists is not None and role_exists is not None:
                print("[init_db] schema exists -> skipping (mode=missing)")
                return

        print(f"[init_db] applying schema file (mode={mode})...")
        sql = SCHEMA_FILE.read_text(encoding="utf-8")
        _run_sql_with_go(conn, sql)
        print("[init_db] schema applied ok")
