# =============================================================================
# Bank Churn Prediction - Unified Production Dockerfile
# Serves both frontend and backend on a single port (8000)
# =============================================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --silent

# Copy frontend source code
COPY frontend/ .

# Build production bundle
RUN npm run build

# =============================================================================
# Stage 2: Production Backend + Frontend
FROM python:3.11-slim AS production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY models/ ./models/

# Copy data file (quotes for space in filename)
COPY ["churn data.csv", "./churn_data.csv"]

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Create models directory if it doesn't exist
RUN mkdir -p /app/models

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production
ENV FRONTEND_DIST_PATH=/app/frontend/dist

# Expose single port
EXPOSE 8000

# Change to backend directory and start server
WORKDIR /app/backend

# Start the unified server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
