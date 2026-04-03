@echo off
REM =============================================================================
REM Bank Churn Prediction - Local Development Mode (Without Docker)
REM Requires: Python 3.11+, Node.js 18+
REM =============================================================================

echo.
echo ========================================
echo   Bank Churn Prediction - Dev Mode
echo ========================================
echo.

REM Check if models exist
if not exist "models\random_forest_model.joblib" (
    echo [INFO] Training ML models first...
    python backend/train_models.py
)

REM Build frontend
echo [1/3] Building frontend...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo [2/3] Starting backend server...
echo.
echo ========================================
echo   Access at: http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo ========================================
echo.

cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
