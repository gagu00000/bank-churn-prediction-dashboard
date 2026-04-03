@echo off
echo ========================================
echo  FIXING POWERSHELL CONDA ERROR
echo ========================================
echo.
echo This will fix the conda error in PowerShell
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0fix-powershell.ps1"

echo.
echo ========================================
echo  DONE!
echo ========================================
echo.
echo NOW: Close ALL PowerShell windows and open a fresh one
echo.
pause
