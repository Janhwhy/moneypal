import asyncio
import sys
import os
from logging.config import fileConfig

# ── Bulletproof sys.path injection ───────────────────────────────────────────
# This MUST be the very first thing that runs, before any 'from app.' imports.
# Alembic loads env.py as a raw file (not via normal import machinery), so
# sys.path is NOT automatically set from PYTHONPATH in all cases.
#
# Docker layout (WORKDIR /app, COPY backend/ -> /app):
#   /app/alembic/env.py   <- this file
#   /app/app/             <- our Python package
#   /app/alembic.ini
#
_here = os.path.dirname(os.path.abspath(__file__))     # /app/alembic
_backend_root = os.path.abspath(os.path.join(_here, ".."))  # /app

# Insert at position 0 so our package takes priority
for _p in [_backend_root, "/app", os.getcwd()]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Debug output to confirm paths are correct
print("[alembic/env.py] sys.path:", sys.path[:5], flush=True)
print("[alembic/env.py] /app contents:", os.listdir("/app") if os.path.exists("/app") else "N/A", flush=True)
# ─────────────────────────────────────────────────────────────────────────────

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
from app.models import Base
target_metadata = Base.metadata


def _resolve_db_url() -> str:
    """
    Return the database URL with the correct async driver prefix.
    Render sets DATABASE_URL as "postgresql://..." but SQLAlchemy async needs
    "postgresql+asyncpg://...". We patch it here, mirroring what db.py does.
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
    """Run migrations in 'offline' mode."""
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
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section) or {}

    # Override with the resolved (driver-prefixed) URL
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
