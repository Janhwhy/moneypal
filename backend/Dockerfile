FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app:.

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Invalidate cache to force Render to pick up env.py changes
ARG CACHE_BUST=1

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "PYTHONPATH=/app python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
