@echo off
echo ========================================
echo  BANK CHURN DASHBOARD - COMPLETE SETUP
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Installing Python packages...
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn xgboost joblib faker imbalanced-learn websockets
if errorlevel 1 (
    echo ERROR: Python package installation failed!
    echo Make sure Python is installed and in your PATH
    pause
    exit /b 1
)

echo.
echo Step 2: Training ML models (this takes 2-3 minutes)...
python train_models.py
if errorlevel 1 (
    echo ERROR: Model training failed!
    pause
    exit /b 1
)

cd ..

echo.
echo Step 3: Installing Node.js packages...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Node package installation failed!
    echo Make sure Node.js is installed and in your PATH
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo To start the dashboard, run: START-DASHBOARD.bat
echo.
pause
