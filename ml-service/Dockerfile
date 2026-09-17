FROM python:3.11-slim

WORKDIR /app

# Install build essentials if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train model if not present
RUN python -c "import os; os.path.exists('model/fraud_model.pkl') or __import__('train')"

ENV PORT=5000
ENV FLASK_DEBUG=false
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120"]
