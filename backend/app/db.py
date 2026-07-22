from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings


def _patch_db_url(url: str) -> str:
    """Patch the DATABASE_URL for asyncpg compatibility:
    1. postgresql:// / postgres://  →  postgresql+asyncpg://
    2. ?sslmode=require              →  ?ssl=require
       (asyncpg uses 'ssl', not 'sslmode')
    """
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    # Fix SSL param name — Neon/Supabase append ?sslmode=require which asyncpg rejects
    url = url.replace("sslmode=require", "ssl=require")
    return url


_db_url = _patch_db_url(settings.DATABASE_URL)
engine = create_async_engine(_db_url, echo=False)


SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
