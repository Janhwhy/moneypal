import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from datetime import datetime
from typing import Optional

from app.db import get_db
from app.models import Expense, User
from app.deps import get_current_user

router = APIRouter(
    prefix="/export",
    tags=["export"],
)

@router.get("/csv")
async def export_csv(
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filters = [Expense.user_id == current_user.id]
    if start:
        filters.append(Expense.occurred_at >= start)
    if end:
        filters.append(Expense.occurred_at <= end)

    query = (
        select(Expense)
        .options(joinedload(Expense.category))
        .filter(and_(*filters))
        .order_by(Expense.occurred_at.asc())
    )

    result = await db.execute(query)
    expenses = result.scalars().all()

    def generate():
        # Yield UTF-8 BOM first so Excel opens the file correctly
        yield "\ufeff"

        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_ALL)
        writer.writerow(["Date", "Time", "Category", "Amount", "Payment Method", "Note"])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for exp in expenses:
            # Use unambiguous date format; QUOTE_ALL prevents Excel from
            # misinterpreting and collapsing the column to ###
            date_str = exp.occurred_at.strftime("%d-%b-%Y")   # e.g. 22-Jul-2026
            time_str = exp.occurred_at.strftime("%H:%M:%S")
            cat_name = exp.category.name if exp.category else "Uncategorized"
            writer.writerow([date_str, time_str, cat_name, str(exp.amount), exp.payment_method or "", exp.note or ""])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    headers = {
        "Content-Disposition": 'attachment; filename="expenses_export.csv"',
        "Content-Type": "text/csv; charset=utf-8-sig",
    }
    return StreamingResponse(generate(), media_type="text/csv; charset=utf-8-sig", headers=headers)
