FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Force Docker to invalidate this layer so COPY . . always runs fresh
ARG CACHE_BUST=unknown

COPY . .

# Verify the app package is visible before starting
RUN python -c "import sys; sys.path.insert(0,'/app'); from app.models import Base; print('app package OK')"

EXPOSE 8000

CMD ["sh", "-c", "python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
