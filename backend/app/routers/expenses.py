from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from app.db import get_db
from app.models import Expense, Category, User
from app.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.deps import get_current_user

# Indian Standard Time (+05:30)
IST = timezone(timedelta(hours=5, minutes=30))

def to_ist_naive(dt: Optional[datetime] = None) -> datetime:
    """Converts datetime to Indian Standard Time and returns naive datetime for SQLite storage."""
    if dt is None:
        return datetime.now(IST).replace(tzinfo=None)
    if dt.tzinfo is not None:
        return dt.astimezone(IST).replace(tzinfo=None)
    return dt

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
)

@router.post("", response_model=ExpenseResponse)
async def create_expense(
    expense: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cat_result = await db.execute(
        select(Category).filter(Category.id == expense.category_id, Category.user_id == current_user.id)
    )
    if not cat_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Invalid category_id")

    occurred = to_ist_naive(expense.occurred_at)

    new_expense = Expense(
        user_id=current_user.id,
        category_id=expense.category_id,
        amount=expense.amount,
        payment_method=expense.payment_method,
        note=expense.note,
        occurred_at=occurred
    )
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)

    stmt = select(Expense).options(joinedload(Expense.category)).filter(Expense.id == new_expense.id)
    res = await db.execute(stmt)
    return res.scalar_one()

@router.get("", response_model=List[ExpenseResponse])
async def get_expenses(
    range: Optional[str] = Query(None, description="day|today|week|month|year|all"),
    category_id: Optional[int] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    limit: int = 200,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Expense).options(joinedload(Expense.category))
    filters = [Expense.user_id == current_user.id]

    if range:
        now = datetime.now(IST).replace(tzinfo=None)
        if range in ("today", "day"):
            start_date = datetime(now.year, now.month, now.day)
            filters.append(Expense.occurred_at >= start_date)
        elif range == "week":
            start_date = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
            filters.append(Expense.occurred_at >= start_date)
        elif range == "month":
            start_date = datetime(now.year, now.month, 1)
            filters.append(Expense.occurred_at >= start_date)
        elif range == "year":
            start_date = datetime(now.year, 1, 1)
            filters.append(Expense.occurred_at >= start_date)

    if start:
        filters.append(Expense.occurred_at >= to_ist_naive(start))
    if end:
        filters.append(Expense.occurred_at <= to_ist_naive(end))
    if category_id:
        filters.append(Expense.category_id == category_id)

    query = query.filter(and_(*filters))
    query = query.order_by(Expense.occurred_at.desc(), Expense.id.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{id}", response_model=ExpenseResponse)
async def get_expense(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Expense)
        .options(joinedload(Expense.category))
        .filter(Expense.id == id, Expense.user_id == current_user.id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.patch("/{id}", response_model=ExpenseResponse)
async def update_expense(
    id: int,
    expense: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Expense).filter(Expense.id == id, Expense.user_id == current_user.id)
    )
    db_expense = result.scalar_one_or_none()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense.category_id is not None:
        cat_result = await db.execute(
            select(Category).filter(Category.id == expense.category_id, Category.user_id == current_user.id)
        )
        if not cat_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Invalid category_id")

    update_data = expense.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "occurred_at" and value is not None:
            value = to_ist_naive(value)
        setattr(db_expense, key, value)

    await db.commit()
    await db.refresh(db_expense)

    stmt = select(Expense).options(joinedload(Expense.category)).filter(Expense.id == db_expense.id)
    res = await db.execute(stmt)
    return res.scalar_one()

@router.delete("/{id}", response_model=ExpenseResponse)
async def delete_expense(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Expense).options(joinedload(Expense.category))
        .filter(Expense.id == id, Expense.user_id == current_user.id)
    )
    db_expense = result.scalar_one_or_none()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    await db.delete(db_expense)
    await db.commit()
    return db_expense

@router.delete("", response_model=dict)
async def delete_all_expenses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import delete
    await db.execute(delete(Expense).filter(Expense.user_id == current_user.id))
    await db.commit()
    return {"message": "All your expenses cleared successfully"}
