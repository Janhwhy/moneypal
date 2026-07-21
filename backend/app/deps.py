from fastapi import Header, HTTPException
from app.config import settings

async def verify_api_key(x_api_key: str = Header(None, alias="X-API-Key")):
    if settings.API_SECRET and x_api_key != settings.API_SECRET:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key
