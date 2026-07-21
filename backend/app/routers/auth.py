from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from jose import jwt
from datetime import datetime, timedelta, timezone

from app.db import get_db
from app.models import User, Category, Setting
from app.config import settings
from app.schemas import AuthResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

DEFAULT_CATEGORIES = [
    ("🍔", "Food"),
    ("🚕", "Transport"),
    ("🛍️", "Shopping"),
    ("💊", "Health"),
    ("🎬", "Entertainment"),
    ("🏠", "Housing"),
    ("📚", "Education"),
    ("✈️", "Travel"),
    ("☕", "Café"),
    ("💡", "Utilities"),
]

def create_jwt(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

@router.post("/google", response_model=AuthResponse)
async def google_auth(body: dict, db: AsyncSession = Depends(get_db)):
    id_token_str = body.get("id_token")
    if not id_token_str:
        raise HTTPException(status_code=400, detail="id_token is required")

    try:
        info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    google_id = info["sub"]
    email = info.get("email", "")
    name = info.get("name", email.split("@")[0])
    picture = info.get("picture")

    # Find or create user
    result = await db.execute(select(User).filter(User.google_id == google_id))
    user = result.scalar_one_or_none()

    is_new_user = user is None
    if is_new_user:
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        db.add(user)
        await db.flush()  # populate user.id before referencing it
    else:
        # Refresh display name / avatar in case they changed
        user.name = name
        user.picture = picture

    # Seed default categories + settings for brand new users
    if is_new_user:
        for i, (emoji, cat_name) in enumerate(DEFAULT_CATEGORIES):
            db.add(Category(user_id=user.id, name=cat_name, emoji=emoji, sort_order=i, is_active=True))
        db.add(Setting(user_id=user.id, monthly_budget=10000.00, currency="INR"))

    await db.commit()
    await db.refresh(user)

    return AuthResponse(
        access_token=create_jwt(user.id),
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture,
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(body: dict = None):
    """Placeholder — real /me is derived from JWT in frontend."""
    raise HTTPException(status_code=501, detail="Use JWT to identify user")
