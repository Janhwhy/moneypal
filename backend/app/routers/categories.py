from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.deps import verify_api_key

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    dependencies=[Depends(verify_api_key)]
)

@router.get("", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category)
        .filter(Category.is_active == True)
        .order_by(Category.sort_order.asc(), Category.id.asc())
    )
    return result.scalars().all()

@router.post("", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    # Find the current max sort order to append
    result = await db.execute(select(Category.sort_order).order_by(Category.sort_order.desc()))
    max_order = result.scalars().first() or 0

    new_cat = Category(
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
async def update_category(id: int, category: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).filter(Category.id == id))
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
async def delete_category(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).filter(Category.id == id))
    db_cat = result.scalar_one_or_none()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")

    # Soft delete
    db_cat.is_active = False
    await db.commit()
    await db.refresh(db_cat)
    return db_cat
