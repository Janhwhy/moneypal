import asyncio
from app.db import engine
from app.models import Base

async def init_db():
    """Create all tables. Categories and settings are seeded per-user on first Google login."""
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
