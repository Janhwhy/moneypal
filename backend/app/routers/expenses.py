from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from app.db import get_db
from app.models import Expense, Category
from app.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.deps import verify_api_key

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
    dependencies=[Depends(verify_api_key)]
)

@router.post("", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    # Verify category exists
    cat_result = await db.execute(select(Category).filter(Category.id == expense.category_id))
    if not cat_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Invalid category_id")

    occurred = expense.occurred_at if expense.occurred_at else datetime.now(timezone.utc)

    new_expense = Expense(
        category_id=expense.category_id,
        amount=expense.amount,
        payment_method=expense.payment_method,
        note=expense.note,
        occurred_at=occurred
    )
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)

    # Reload with category loaded
    stmt = select(Expense).options(joinedload(Expense.category)).filter(Expense.id == new_expense.id)
    res = await db.execute(stmt)
    return res.scalar_one()

@router.get("", response_model=List[ExpenseResponse])
async def get_expenses(
    range: Optional[str] = Query(None, description="today|week|month|all"),
    category_id: Optional[int] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    query = select(Expense).options(joinedload(Expense.category))
    filters = []

    # Calculate start / end times based on range if provided
    if range:
        now = datetime.now(timezone.utc)
        if range == "today":
            start_date = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
            filters.append(Expense.occurred_at >= start_date)
        elif range == "week":
            # Monday is 0, Sunday is 6
            start_date = datetime(now.year, now.month, now.day, tzinfo=timezone.utc) - timedelta(days=now.weekday())
            filters.append(Expense.occurred_at >= start_date)
        elif range == "month":
            start_date = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
            filters.append(Expense.occurred_at >= start_date)

    # Apply explicit start / end filters
    if start:
        filters.append(Expense.occurred_at >= start)
    if end:
        filters.append(Expense.occurred_at <= end)

    if category_id:
        filters.append(Expense.category_id == category_id)

    if filters:
        query = query.filter(and_(*filters))

    query = query.order_by(Expense.occurred_at.desc(), Expense.id.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{id}", response_model=ExpenseResponse)
async def get_expense(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Expense)
        .options(joinedload(Expense.category))
        .filter(Expense.id == id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.patch("/{id}", response_model=ExpenseResponse)
async def update_expense(id: int, expense: ExpenseUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).filter(Expense.id == id))
    db_expense = result.scalar_one_or_none()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense.category_id is not None:
        cat_result = await db.execute(select(Category).filter(Category.id == expense.category_id))
        if not cat_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Invalid category_id")

    update_data = expense.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_expense, key, value)

    await db.commit()
    await db.refresh(db_expense)

    # Reload with category
    stmt = select(Expense).options(joinedload(Expense.category)).filter(Expense.id == db_expense.id)
    res = await db.execute(stmt)
    return res.scalar_one()

@router.delete("/{id}", response_model=ExpenseResponse)
async def delete_expense(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).options(joinedload(Expense.category)).filter(Expense.id == id))
    db_expense = result.scalar_one_or_none()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    await db.delete(db_expense)
    await db.commit()
    return db_expense

@router.delete("", response_model=dict)
async def delete_all_expenses(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import delete
    await db.execute(delete(Expense))
    await db.commit()
    return {"message": "All expenses cleared successfully"}
