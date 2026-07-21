from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import calendar
from decimal import Decimal

from app.db import get_db
from app.models import Expense, Category, Setting
from app.schemas import SummaryResponse, CategorySpendItem, MonthSpendItem
from app.deps import verify_api_key

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    dependencies=[Depends(verify_api_key)]
)

def get_period_dates(period: str):
    now = datetime.now(timezone.utc)
    if period == "week":
        # Monday is start of the week
        start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc) - timedelta(days=now.weekday())
        days_elapsed = now.weekday() + 1
        total_days = 7
    elif period == "month":
        start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        days_elapsed = now.day
        total_days = calendar.monthrange(now.year, now.month)[1]
    elif period == "year":
        start = datetime(now.year, 1, 1, tzinfo=timezone.utc)
        days_elapsed = (now - start).days + 1
        total_days = 366 if calendar.isleap(now.year) else 365
    else:
        # Default fallback to month
        start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        days_elapsed = now.day
        total_days = calendar.monthrange(now.year, now.month)[1]

    return start, now, days_elapsed, total_days

@router.get("/summary", response_model=SummaryResponse)
async def get_summary(period: str = "month", db: AsyncSession = Depends(get_db)):
    start, end, days_elapsed, total_days = get_period_dates(period)

    # Calculate spent in the period
    spent_stmt = select(func.sum(Expense.amount)).filter(
        and_(Expense.occurred_at >= start, Expense.occurred_at <= end)
    )
    spent_res = await db.execute(spent_stmt)
    spent = spent_res.scalar() or Decimal("0.00")

    # Get budget
    settings_stmt = select(Setting).filter(Setting.id == 1)
    settings_res = await db.execute(settings_stmt)
    settings = settings_res.scalar_one_or_none()
    monthly_budget = settings.monthly_budget if settings else Decimal("10000.00")

    # Budget left calculation (typically for the current month)
    if period == "month":
        budget_left = monthly_budget - spent
    else:
        # Scale or fetch current month budget left
        now = datetime.now(timezone.utc)
        month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        m_spent_stmt = select(func.sum(Expense.amount)).filter(
            and_(Expense.occurred_at >= month_start, Expense.occurred_at <= end)
        )
        m_spent_res = await db.execute(m_spent_stmt)
        m_spent = m_spent_res.scalar() or Decimal("0.00")
        budget_left = monthly_budget - m_spent

    # Pace projection: (spent / days_elapsed) * total_days
    days_elapsed = max(days_elapsed, 1)
    pace_projection = (spent / Decimal(str(days_elapsed))) * Decimal(str(total_days))

    # Daily average
    daily_average = spent / Decimal(str(days_elapsed))

    return SummaryResponse(
        spent=spent,
        budget_left=budget_left,
        pace_projection=pace_projection,
        daily_average=daily_average
    )

@router.get("/by-category", response_model=List[CategorySpendItem])
async def get_by_category(period: str = "month", db: AsyncSession = Depends(get_db)):
    start, end, _, _ = get_period_dates(period)

    # Total spent in period
    total_spent_stmt = select(func.sum(Expense.amount)).filter(
        and_(Expense.occurred_at >= start, Expense.occurred_at <= end)
    )
    total_spent_res = await db.execute(total_spent_stmt)
    total_spent = total_spent_res.scalar() or Decimal("0.00")

    # Spent by category
    stmt = (
        select(
            Category.id,
            Category.name,
            Category.emoji,
            func.sum(Expense.amount).label("amount")
        )
        .join(Expense, Expense.category_id == Category.id)
        .filter(and_(Expense.occurred_at >= start, Expense.occurred_at <= end))
        .group_by(Category.id, Category.name, Category.emoji)
        .order_by(func.sum(Expense.amount).desc())
    )

    result = await db.execute(stmt)
    rows = result.all()

    items = []
    for row in rows:
        pct = float((row.amount / total_spent) * 100) if total_spent > 0 else 0.0
        items.append(
            CategorySpendItem(
                category_id=row.id,
                name=row.name,
                emoji=row.emoji,
                amount=row.amount,
                percent=pct
            )
        )
    return items

@router.get("/by-month", response_model=List[MonthSpendItem])
async def get_by_month(year: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    if not year:
        year = datetime.now(timezone.utc).year

    start_date = datetime(year, 1, 1, tzinfo=timezone.utc)
    end_date = datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

    # Group by month using database extract
    stmt = (
        select(
            func.extract('month', Expense.occurred_at).label('month_num'),
            func.sum(Expense.amount).label('amount')
        )
        .filter(and_(Expense.occurred_at >= start_date, Expense.occurred_at <= end_date))
        .group_by(func.extract('month', Expense.occurred_at))
        .order_by(func.extract('month', Expense.occurred_at))
    )

    result = await db.execute(stmt)
    rows = result.all()

    # Map month numbers to abbreviated month names
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_map = {m: Decimal("0.00") for m in month_names}

    for row in rows:
        month_idx = int(row.month_num) - 1
        if 0 <= month_idx < 12:
            m_name = month_names[month_idx]
            monthly_map[m_name] = row.amount

    return [MonthSpendItem(month=k, amount=v) for k, v in monthly_map.items()]
