import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///../tappy.db"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    JWT_SECRET: str = "moneypal_jwt_fallback_secret"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days
    # Comma-separated list of allowed CORS origins.
    # In production set this to your Vercel URL, e.g.:
    #   ALLOWED_ORIGINS=https://moneypal.vercel.app
    # Use "*" only for local development (not recommended with credentials).
    ALLOWED_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
