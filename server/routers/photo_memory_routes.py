# server/routers/photo_memory_routes.py

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pathlib import Path
import uuid
import shutil
from datetime import date

from ..deps import get_db
from .auth_routes import _user_id_from_authorization
from typing import Optional

router = APIRouter(
    prefix="/photo-memories",
    tags=["photo_memories"],
)

# Project root = parent of "server"
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MEDIA_ROOT = PROJECT_ROOT / "media"  # same folder used in main.py
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_photo_memory(
    caption: str | None = Form(default=None),
    memory_date: str | None = Form(default=None),  # optional "YYYY-MM-DD"
    file: UploadFile = File(...),
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    # Limit to 10 memories per user
    count_row = db.execute(
        text("SELECT COUNT(*) AS cnt FROM dbo.HappyMemories WHERE user_id = :uid"),
        {"uid": user_id},
    ).fetchone()
    if count_row and count_row.cnt >= 10:
        raise HTTPException(
            status_code=400,
            detail="You can upload up to 10 happy memories. Please delete one before adding a new one.",
        )

    # Basic file type check
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    # Generate file path: media/user_{user_id}/<guid>.ext
    user_folder = MEDIA_ROOT / f"user_{user_id}"
    user_folder.mkdir(parents=True, exist_ok=True)

    ext = ".jpg"
    if file.filename and "." in file.filename:
        ext = "." + file.filename.rsplit(".", 1)[-1].lower()

    filename = f"{uuid.uuid4()}{ext}"
    filepath = user_folder / filename

    # Save file to disk
    with filepath.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # This is the URL the frontend should use
    image_url = f"/media/user_{user_id}/{filename}"

    # Parse memory_date if provided
    mem_date_val: date | None = None
    if memory_date:
        try:
            mem_date_val = date.fromisoformat(memory_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid memory_date format (expected YYYY-MM-DD).",
            )

    # Insert into DB
    db.execute(
        text(
            """
            INSERT INTO dbo.HappyMemories (user_id, image_url, caption, memory_date)
            VALUES (:uid, :url, :caption, :mem_date)
            """
        ),
        {
            "uid": user_id,
            "url": image_url,
            "caption": caption,
            "mem_date": mem_date_val,
        },
    )
    db.commit()

    return {"image_url": image_url}


@router.get("")
def list_photo_memories(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        text(
            """
            SELECT TOP 10 memory_id, image_url, caption, memory_date, created_at
            FROM dbo.HappyMemories
            WHERE user_id = :uid
            ORDER BY created_at DESC
            """
        ),
        {"uid": user_id},
    ).fetchall()

    return [
        {
            "memory_id": str(r.memory_id),
            "image_url": r.image_url,
            "caption": r.caption,
            "memory_date": r.memory_date.isoformat() if r.memory_date else None,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.delete("/{memory_id}")
def delete_photo_memory(
    memory_id: str,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    # ensure it belongs to this user
    row = db.execute(
        text(
            """
            SELECT image_url
            FROM dbo.HappyMemories
            WHERE memory_id = :mid AND user_id = :uid
            """
        ),
        {"mid": memory_id, "uid": user_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Memory not found")

    image_url = row.image_url  # "/media/user_xxx/filename.jpg"

    # best-effort to remove file from disk
    if isinstance(image_url, str) and image_url.startswith("/media/"):
        # strip the /media/ prefix and map into MEDIA_ROOT
        rel_path = image_url.replace("/media/", "", 1).lstrip("/")
        disk_path = MEDIA_ROOT / rel_path
        try:
            if disk_path.exists():
                disk_path.unlink()
        except Exception:
            # ignore file delete errors
            pass

    db.execute(
        text(
            "DELETE FROM dbo.HappyMemories WHERE memory_id = :mid AND user_id = :uid"
        ),
        {"mid": memory_id, "uid": user_id},
    )
    db.commit()

    return {"ok": True}


@router.put("/{memory_id}")
def update_photo_memory(
    memory_id: str,
    payload: dict,
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    """
    Edit caption / memory_date (not the image).
    Body: { "caption": "...", "memory_date": "YYYY-MM-DD" | null }
    """
    caption = payload.get("caption")
    memory_date_str = payload.get("memory_date")

    mem_date_val: date | None = None
    if memory_date_str:
        try:
            mem_date_val = date.fromisoformat(memory_date_str)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid memory_date format (expected YYYY-MM-DD).",
            )

    # ensure memory exists and belongs to user
    existing = db.execute(
        text(
            """
            SELECT memory_id
            FROM dbo.HappyMemories
            WHERE memory_id = :mid AND user_id = :uid
            """
        ),
        {"mid": memory_id, "uid": user_id},
    ).fetchone()

    if not existing:
        raise HTTPException(status_code=404, detail="Memory not found")

    db.execute(
        text(
            """
            UPDATE dbo.HappyMemories
            SET caption = :caption,
                memory_date = :mem_date
            WHERE memory_id = :mid AND user_id = :uid
            """
        ),
        {
            "caption": caption,
            "mem_date": mem_date_val,
            "mid": memory_id,
            "uid": user_id,
        },
    )
    db.commit()

    return {"ok": True}

@router.get("/weekly-candidate")
def weekly_photo_candidate(
    user_id: str = Depends(_user_id_from_authorization),
    db: Session = Depends(get_db),
):
    """
    Return one 'happy memory' candidate for the weekly reminder popup.

    Response format:

    {
      "show": bool,
      "message": str | null,
      "memory": {
        "memory_id": str,
        "image_url": str,
        "caption": str | null,
        "memory_date": str | null,
        "created_at": str
      } | null
    }
    """

    row = db.execute(
        text(
            """
            SELECT TOP 1 memory_id, image_url, caption, memory_date, created_at
            FROM dbo.HappyMemories
            WHERE user_id = :uid
            ORDER BY created_at DESC
            """
        ),
        {"uid": user_id},
    ).fetchone()

    if not row:
        # no memories for this user → nothing to show
        return {
            "show": False,
            "message": None,
            "memory": None,
        }

    memory = {
        "memory_id": str(row.memory_id),
        "image_url": row.image_url,
        "caption": row.caption,
        "memory_date": row.memory_date.isoformat() if row.memory_date else None,
        "created_at": row.created_at.isoformat(),
    }

    return {
        "show": True,
        "message": "Remember that you have beautiful moments — this is one of them.",
        "memory": memory,
    }
