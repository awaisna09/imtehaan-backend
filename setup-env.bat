@echo off
echo 🔧 Setting up environment variables for Imtehaan AI EdTech Platform
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python first.
    pause
    exit /b 1
)

REM Run the setup script
python setup-env.py

echo.
echo Press any key to exit...
pause >nul
