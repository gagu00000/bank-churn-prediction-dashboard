@echo off
REM Quick start script for Bank Churn Dashboard (Windows)

echo Starting Bank Churn Dashboard...
echo.

REM Check if models exist
if not exist "models\random_forest_model.joblib" (
    echo Models not found. Training models first...
    cd backend
    python train_models.py
    cd ..
)

REM Check for Docker
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting with Docker Compose...
    docker-compose up
) else (
    echo Docker Compose not found. Starting manually...
    echo.
    echo Starting backend in new window...
    start "Backend API" cmd /k "cd backend && python app.py"
    
    echo Starting frontend in new window...
    start "Frontend Dashboard" cmd /k "cd frontend && npm run dev"
    
    echo.
    echo Application started!
    echo.
    echo Backend: http://localhost:8000
    echo Frontend: http://localhost:5173
    echo API Docs: http://localhost:8000/docs
    echo.
    echo Press any key to stop all services...
    pause >nul
    
    taskkill /FI "WINDOWTITLE eq Backend API" /F
    taskkill /FI "WINDOWTITLE eq Frontend Dashboard" /F
)
