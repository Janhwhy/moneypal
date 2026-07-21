from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db import get_db
from app.models import Category, User
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.deps import get_current_user

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
)

@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Category)
        .filter(Category.user_id == current_user.id, Category.is_active == True)
        .order_by(Category.sort_order.asc(), Category.id.asc())
    )
    return result.scalars().all()

@router.post("", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Category.sort_order)
        .filter(Category.user_id == current_user.id)
        .order_by(Category.sort_order.desc())
    )
    max_order = result.scalars().first() or 0

    new_cat = Category(
        user_id=current_user.id,
        name=category.name,
        emoji=category.emoji,
        sort_order=max_order + 1,
        is_active=True
    )
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    return new_cat

@router.patch("/{id}", response_model=CategoryResponse)
async def update_category(
    id: int,
    category: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Category).filter(Category.id == id, Category.user_id == current_user.id)
    )
    db_cat = result.scalar_one_or_none()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cat, key, value)

    await db.commit()
    await db.refresh(db_cat)
    return db_cat

@router.delete("/{id}", response_model=CategoryResponse)
async def delete_category(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Category).filter(Category.id == id, Category.user_id == current_user.id)
    )
    db_cat = result.scalar_one_or_none()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")

    db_cat.is_active = False
    await db.commit()
    await db.refresh(db_cat)
    return db_cat
