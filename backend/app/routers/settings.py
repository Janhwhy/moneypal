from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_db
from app.models import Setting
from app.schemas import SettingResponse, SettingUpdate
from app.deps import verify_api_key

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    dependencies=[Depends(verify_api_key)]
)

@router.get("", response_model=SettingResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting).filter(Setting.id == 1))
    settings = result.scalar_one_or_none()
    if not settings:
        # Fallback to create if missing
        settings = Setting(id=1, monthly_budget=10000.00, currency="INR")
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings

@router.patch("", response_model=SettingResponse)
async def update_settings(settings_update: SettingUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting).filter(Setting.id == 1))
    db_settings = result.scalar_one_or_none()
    if not db_settings:
        db_settings = Setting(id=1, monthly_budget=10000.00, currency="INR")
        db.add(db_settings)
        await db.commit()
        await db.refresh(db_settings)

    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)

    await db.commit()
    await db.refresh(db_settings)
    return db_settings
