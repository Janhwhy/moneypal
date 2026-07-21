from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import categories, expenses, analytics, settings, export

app = FastAPI(
    title="Tappy Budget Tracker API",
    description="Backend API for Tappy-style budget tracker iOS PWA app",
    version="1.0.0"
)

# Configure CORS to support requests from Vercel / local Vite server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to specific domains in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(categories.router)
app.include_router(expenses.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(export.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "Tappy Budget Tracker API",
        "documentation": "/docs"
    }
