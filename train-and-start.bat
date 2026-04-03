@echo off
echo ============================================
echo Bank Churn Dashboard - Train and Start
echo ============================================
echo.

echo Step 1: Building Docker containers...
docker-compose build

echo.
echo Step 2: Training ML models in container...
docker-compose run --rm backend python train_models.py

echo.
echo Step 3: Starting the application...
docker-compose up

echo.
echo ============================================
echo Dashboard will be available at:
echo http://localhost:5173
echo ============================================
