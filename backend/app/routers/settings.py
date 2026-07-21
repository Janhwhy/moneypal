from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_db
from app.models import Setting, User
from app.schemas import SettingResponse, SettingUpdate
from app.deps import get_current_user

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

@router.get("", response_model=SettingResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Setting).filter(Setting.user_id == current_user.id))
    user_settings = result.scalar_one_or_none()
    if not user_settings:
        # Shouldn't normally happen — created on first login — but handle gracefully
        user_settings = Setting(user_id=current_user.id, monthly_budget=10000.00, currency="INR")
        db.add(user_settings)
        await db.commit()
        await db.refresh(user_settings)
    return user_settings

@router.patch("", response_model=SettingResponse)
async def update_settings(
    settings_update: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Setting).filter(Setting.user_id == current_user.id))
    db_settings = result.scalar_one_or_none()
    if not db_settings:
        db_settings = Setting(user_id=current_user.id, monthly_budget=10000.00, currency="INR")
        db.add(db_settings)
        await db.commit()
        await db.refresh(db_settings)

    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)

    await db.commit()
    await db.refresh(db_settings)
    return db_settings
