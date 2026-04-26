FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

# --preload: load app once before forking workers so startup is fast per-worker
# --workers 2: one worker can serve health checks while the other handles requests
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn unisphere.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120 --preload"]
