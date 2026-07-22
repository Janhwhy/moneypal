FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app:.

# Copy requirements from backend folder
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ .

EXPOSE 8000

# Run Alembic migrations then start the API server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
