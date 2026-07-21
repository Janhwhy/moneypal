from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal

# ── Auth / User Schemas ──────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    picture: Optional[str] = None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ── Category Schemas ─────────────────────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str
    emoji: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    sort_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ── Expense Schemas ──────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    category_id: int
    amount: Decimal = Field(..., max_digits=12, decimal_places=2)
    payment_method: str = "cash"  # "cash" | "upi"
    note: Optional[str] = None
    occurred_at: Optional[datetime] = None

class ExpenseUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, max_digits=12, decimal_places=2)
    payment_method: Optional[str] = None
    note: Optional[str] = None
    occurred_at: Optional[datetime] = None

class ExpenseResponse(BaseModel):
    id: int
    category_id: int
    amount: Decimal
    payment_method: str
    note: Optional[str] = None
    occurred_at: datetime
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# ── Settings Schemas ─────────────────────────────────────────────────────────

class SettingBase(BaseModel):
    monthly_budget: Decimal = Field(..., max_digits=12, decimal_places=2)
    currency: str

class SettingUpdate(BaseModel):
    monthly_budget: Optional[Decimal] = Field(None, max_digits=12, decimal_places=2)
    currency: Optional[str] = None

class SettingResponse(SettingBase):
    id: int

    class Config:
        from_attributes = True

# ── Analytics Response Schemas ───────────────────────────────────────────────

class SummaryResponse(BaseModel):
    spent: Decimal
    budget_left: Decimal
    pace_projection: Decimal
    daily_average: Decimal

class CategorySpendItem(BaseModel):
    category_id: int
    name: str
    emoji: str
    amount: Decimal
    percent: float

class MonthSpendItem(BaseModel):
    month: str  # e.g., "Jan"
    amount: Decimal
