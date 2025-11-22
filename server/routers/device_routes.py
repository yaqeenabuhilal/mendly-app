# server/routers/device_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, deps, auth

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("/register", response_model=dict)
def register_device(
    payload: schemas.DeviceRegister,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Register or update a device token for the current user.
    Called from the mobile app / client when it gets an FCM token.
    """

    if payload.platform not in ("android", "ios"):
        raise HTTPException(status_code=400, detail="Invalid platform")

    # Check if token exists already
    existing = (
        db.query(models.UserDeviceToken)
        .filter(models.UserDeviceToken.fcm_token == payload.fcm_token)
        .first()
    )

    if existing:
        existing.user_id = current_user.user_id
        existing.platform = payload.platform
        existing.app_version = payload.app_version
        existing.is_active = True
    else:
        new_token = models.UserDeviceToken(
            user_id=current_user.user_id,
            platform=payload.platform,
            fcm_token=payload.fcm_token,
            app_version=payload.app_version,
            is_active=True,
        )
        db.add(new_token)

    db.commit()
    return {"ok": True}
