import asyncio
import sys
import os
from logging.config import fileConfig

# ── sys.path injection — MUST run before any 'from app.' import ──────────────
# Alembic loads env.py as a raw file (not via normal import machinery), so
# PYTHONPATH alone is not guaranteed. We resolve the backend root explicitly.
#
# Docker layout (WORKDIR /app, backend/ copied to /app):
#   /app/alembic/env.py   ← this file
#   /app/app/             ← our Python package
#
_here = os.path.dirname(os.path.abspath(__file__))           # /app/alembic
_backend_root = os.path.abspath(os.path.join(_here, ".."))   # /app

for _p in [_backend_root, "/app"]:
    if _p not in sys.path:
        sys.path.insert(0, _p)
# ─────────────────────────────────────────────────────────────────────────────

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.models import Base
target_metadata = Base.metadata


def _resolve_db_url() -> str:
    """
    Read DATABASE_URL from app.config and ensure the correct async driver prefix.
    Render provides 'postgresql://...' but SQLAlchemy async requires 'postgresql+asyncpg://'.
    """
    try:
        from app.config import settings
        url = settings.DATABASE_URL
    except ImportError:
        url = config.get_main_option("sqlalchemy.url") or ""

    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generates SQL without a live connection)."""
    url = _resolve_db_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connects to the real database)."""
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = _resolve_db_url()

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
