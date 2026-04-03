@echo off
echo ========================================
echo  STARTING BANK CHURN DASHBOARD
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Backend Server on http://localhost:8000...
cd backend
start "Churn Backend API" cmd /k "python app.py"

timeout /t 5 /nobreak > nul

echo Starting Frontend Dashboard on http://localhost:5173...
cd ..\frontend
start "Churn Dashboard" cmd /k "npm run dev"

echo.
echo ========================================
echo  DASHBOARD STARTING...
echo ========================================
echo.
echo Wait 10 seconds, then open your browser to:
echo.
echo   http://localhost:5173
echo.
echo Press any key to STOP the dashboard...
pause > nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Churn Backend API*" /F 2>nul
taskkill /FI "WINDOWTITLE eq Churn Dashboard*" /F 2>nul
echo Done!
