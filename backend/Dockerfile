# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Create models directory first
RUN mkdir -p /app/models

# Copy models and data
COPY models/ /app/models/

# Copy data file (quotes for space in filename)
COPY ["churn data.csv", "/app/churn_data.csv"]

# Verify models are present
RUN ls -la /app/models/

# Expose port
EXPOSE 8000

# Command
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
