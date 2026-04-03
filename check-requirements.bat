@echo off
echo ========================================
echo SYSTEM DIAGNOSTIC
echo ========================================
echo.

echo Checking Python...
where python 2>nul
if errorlevel 1 (
    echo [X] Python NOT found
    echo     Install from: https://www.python.org/downloads/
) else (
    python --version
    echo [OK] Python found
)

echo.
echo Checking Node.js...
where node 2>nul
if errorlevel 1 (
    echo [X] Node.js NOT found
    echo     Install from: https://nodejs.org/
) else (
    node --version
    echo [OK] Node.js found
)

echo.
echo Checking Docker...
where docker 2>nul
if errorlevel 1 (
    echo [X] Docker NOT found
) else (
    docker --version
    echo [OK] Docker found
)

echo.
echo ========================================
echo RECOMMENDATION:
echo ========================================
echo.

where python 2>nul
if errorlevel 1 (
    echo 1. Install Python from: https://www.python.org/downloads/
    echo 2. Install Node.js from: https://nodejs.org/
    echo 3. Then run: setup-local.bat
) else (
    where node 2>nul
    if errorlevel 1 (
        echo 1. Install Node.js from: https://nodejs.org/
        echo 2. Then run: setup-local.bat
    ) else (
        echo Everything is ready!
        echo.
        echo Run: setup-local.bat (to install dependencies)
        echo Then: start-local.bat (to start the dashboard)
    )
)

echo.
pause
