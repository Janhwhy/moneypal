import asyncio
from sqlalchemy import select
from app.db import engine, SessionLocal
from app.models import Base, Category, Setting

DEFAULT_CATEGORIES = [
    {"name": "Food", "emoji": "🍔", "sort_order": 1},
    {"name": "Transport", "emoji": "🚕", "sort_order": 2},
    {"name": "Shopping", "emoji": "🛍️", "sort_order": 3},
    {"name": "Bills", "emoji": "🧾", "sort_order": 4},
    {"name": "Entertainment", "emoji": "🎬", "sort_order": 5},
]

async def init_db():
    print("Creating tables...")
    async with engine.begin() as conn:
        # For development, we can create tables directly.
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

    async with SessionLocal() as db:
        # Check if settings exist
        result = await db.execute(select(Setting).filter_by(id=1))
        setting = result.scalar_one_or_none()
        if not setting:
            print("Seeding default settings...")
            setting = Setting(id=1, monthly_budget=10000.00, currency="INR")
            db.add(setting)

        # Check if categories exist
        result = await db.execute(select(Category))
        categories = result.scalars().all()
        if not categories:
            print("Seeding default categories...")
            for cat_data in DEFAULT_CATEGORIES:
                category = Category(
                    name=cat_data["name"],
                    emoji=cat_data["emoji"],
                    sort_order=cat_data["sort_order"],
                    is_active=True
                )
                db.add(category)
        
        await db.commit()
    print("Database initialization/seeding complete.")

if __name__ == "__main__":
    asyncio.run(init_db())
