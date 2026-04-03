@echo off
REM =============================================================================
REM Bank Churn Prediction - Docker Startup Script
REM Single Port Architecture - Everything runs on http://localhost:8000
REM =============================================================================

echo.
echo ========================================
echo   Bank Churn Prediction Dashboard
echo   Single Port Architecture (8000)
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [1/3] Checking for trained models...
if not exist "models\random_forest_model.joblib" (
    echo [INFO] Models not found. Training models first...
    python backend/train_models.py
    if errorlevel 1 (
        echo [ERROR] Model training failed. Please check Python environment.
        pause
        exit /b 1
    )
)
echo [OK] Models found.

echo.
echo [2/3] Building Docker container (this may take a few minutes first time)...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Docker build failed.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting the application...
docker-compose up -d

echo.
echo ========================================
echo   SUCCESS! Application is starting...
echo ========================================
echo.
echo   Access the dashboard at:
echo.
echo   >>> http://localhost:8000 <<<
echo.
echo   API Documentation: http://localhost:8000/docs
echo.
echo   To stop: docker-compose down
echo   To view logs: docker-compose logs -f
echo.
echo ========================================

REM Wait a moment then open browser
timeout /t 5 /nobreak >nul
start http://localhost:8000

echo.
echo Press any key to view container logs (Ctrl+C to stop)...
pause >nul
docker-compose logs -f
