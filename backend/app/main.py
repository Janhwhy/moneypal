from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import categories, expenses, analytics, settings, export
from app.routers import auth
from app.db import engine
from app.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (safe to call multiple times — uses CREATE IF NOT EXISTS)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="MoneyPal API",
    description="Backend API for MoneyPal budget tracker",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth (no JWT required for login itself)
app.include_router(auth.router)

# Protected routers (all require Bearer JWT)
app.include_router(categories.router)
app.include_router(expenses.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(export.router)

@app.get("/")
async def root():
    return {"status": "online", "app": "MoneyPal API", "documentation": "/docs"}
