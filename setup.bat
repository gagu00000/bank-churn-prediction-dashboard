@echo off
REM Bank Churn Dashboard Setup Script for Windows
REM This script sets up the complete project including training models

echo ==================================
echo Bank Churn Dashboard Setup
echo ==================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Python not found. Please install Python 3.11+
    exit /b 1
)

echo + Python found
python --version

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Node.js not found. Please install Node.js 18+
    exit /b 1
)

echo + Node.js found
node --version

REM Install Python dependencies
echo.
echo Installing Python dependencies...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo X Failed to install Python dependencies
    exit /b 1
)

echo + Python dependencies installed

REM Train ML models
echo.
echo Training ML models...
cd backend
python train_models.py

if %errorlevel% neq 0 (
    echo X Model training failed
    exit /b 1
)

cd ..
echo + ML models trained successfully

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install

if %errorlevel% neq 0 (
    echo X Failed to install frontend dependencies
    exit /b 1
)

cd ..
echo + Frontend dependencies installed

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo To start the application:
echo.
echo   Option 1: Using Docker (Recommended)
echo     docker-compose up --build
echo.
echo   Option 2: Manual Start
echo     Terminal 1: cd backend ^&^& python app.py
echo     Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Access the dashboard at: http://localhost:5173
echo API documentation at: http://localhost:8000/docs
echo.

pause
