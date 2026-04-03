@echo off
echo ========================================
echo Starting Bank Churn Dashboard (LOCAL)
echo ========================================
echo.
echo Backend will start on: http://localhost:8000
echo Frontend will start on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

cd backend
start "Churn Backend" cmd /k "python app.py"
timeout /t 3 /nobreak > nul

cd ..\frontend
start "Churn Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Wait 10 seconds then open: http://localhost:5173
echo ========================================
echo.
echo Press any key to stop both servers...
pause > nul

taskkill /FI "WINDOWTITLE eq Churn Backend*" /F
taskkill /FI "WINDOWTITLE eq Churn Frontend*" /F
