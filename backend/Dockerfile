FROM python:3.11-slim

WORKDIR /app

# Set Python path so 'app' package is always importable
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Sanity-check: verify the app package is importable at build time
# If this fails the build fails immediately with a clear error
RUN python -c "from app.models import Base; print('✓ app package OK')"

EXPOSE 8000

# Run migrations, then start the server using a shell script approach
# Using exec form with sh -c to handle the && chain cleanly
CMD ["sh", "-c", "python -m alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
