@echo off
echo ============================================
echo Bank Churn Dashboard - Quick Start
echo ============================================
echo.
echo This will:
echo 1. Train ML models inside Docker
echo 2. Start the full application
echo.
pause

echo.
echo Training models (this takes 2-3 minutes)...
docker-compose run --rm backend python train_models.py

if errorlevel 1 (
    echo.
    echo ERROR: Model training failed!
    pause
    exit /b 1
)

echo.
echo Starting application...
echo Dashboard will be at: http://localhost:5173
echo API docs will be at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the application
echo.
docker-compose up
