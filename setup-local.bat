@echo off
echo ========================================
echo Bank Churn Dashboard - LOCAL SETUP
echo (No Docker Required)
echo ========================================
echo.

echo Checking Python installation...
python --version 2>nul
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Checking Node.js installation...
node --version 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ========================================
echo STEP 1: Installing Python Dependencies
echo ========================================
cd backend
pip install -r ..\requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python packages!
    pause
    exit /b 1
)

echo.
echo ========================================
echo STEP 2: Training ML Models
echo ========================================
python train_models.py
if errorlevel 1 (
    echo ERROR: Model training failed!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo STEP 3: Installing Node Dependencies
echo ========================================
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node packages!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo To start the application, run: start-local.bat
echo.
pause
