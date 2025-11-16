# server/db.py
import os, urllib.parse
from pathlib import Path
from dotenv import load_dotenv # type: ignore
from sqlalchemy import create_engine # type: ignore
from sqlalchemy.orm import sessionmaker, DeclarativeBase    # type: ignore
class Base(DeclarativeBase):
    pass
# Load the .env that sits in the *server/* folder
env_path = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=env_path, override=True)

odbc_str = os.getenv("DATABASE_URL_ODBC")
assert odbc_str, "DATABASE_URL_ODBC missing in .env"
params = urllib.parse.quote_plus(odbc_str)

engine = create_engine(
    f"mssql+pyodbc:///?odbc_connect={params}",
    pool_pre_ping=True,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
