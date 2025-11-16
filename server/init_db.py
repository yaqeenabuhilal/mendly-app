# server/init_db.py
from pathlib import Path
import os
import urllib.parse

from dotenv import load_dotenv  # type: ignore
from sqlalchemy import create_engine, text  # type: ignore

# Load .env next to this file
env_path = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=env_path, override=True)

DB_NAME = "Mendly"
SCHEMA_FILE = Path(__file__).with_name("mendly_schema.sql")


def _build_master_engine():
    """
    Connect to SQL Server 'master' so we can CREATE DATABASE Mendly
    outside of any explicit transaction.
    """
    odbc_str = os.getenv("DATABASE_URL_ODBC")
    if not odbc_str:
        raise RuntimeError("DATABASE_URL_ODBC missing in .env")

    parts = [p for p in odbc_str.split(";") if p]
    # Remove any existing Database=... setting
    parts = [p for p in parts if not p.lower().startswith("database=")]
    # Force master
    parts.append("Database=master")
    master_odbc = ";".join(parts)

    params = urllib.parse.quote_plus(master_odbc)
    # NOTE: isolation_level='AUTOCOMMIT' so CREATE DATABASE is allowed
    engine = create_engine(
        f"mssql+pyodbc:///?odbc_connect={params}",
        pool_pre_ping=True,
        future=True,
        isolation_level="AUTOCOMMIT",
    )
    return engine


def ensure_database_and_schema():
    """
    1) Ensure Mendly DB exists.
    2) If dbo.Users does NOT exist inside Mendly, apply mendly_schema.sql once.
    """
    print("[init_db] starting DB check...")

    # 1) Create DB if needed (no transaction, AUTOCOMMIT)
    master_engine = _build_master_engine()
    with master_engine.connect() as conn:
        print("[init_db] Checking if database Mendly exists on server...")
        conn.execute(
            text(f"IF DB_ID(N'{DB_NAME}') IS NULL CREATE DATABASE {DB_NAME};")
        )
        print("[init_db] Database Mendly exists or was just created.")

    # 2) Connect to Mendly and check for tables using your normal engine
    from .db import engine

    with engine.begin() as conn:
        print("[init_db] Checking if schema already exists (looking for dbo.Users)...")
        exists = conn.execute(
            text("SELECT COUNT(*) FROM sys.tables WHERE name = 'Users'")
        ).scalar_one()

        if exists:
            print("[init_db] Schema already present, skipping migration script.")
            return

        print("[init_db] Applying mendly_schema.sql ...")
        sql = SCHEMA_FILE.read_text(encoding="utf-8")
        conn.exec_driver_sql(sql)
        print("[init_db] Mendly schema created successfully.")

