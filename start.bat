@echo off
echo 🚀 Starting Imtehaan AI EdTech Platform
echo 📁 Complete build with all files included
echo.

REM Check if config.env exists
if not exist "config.env" (
    echo ⚠️  config.env not found, copying from example...
    copy config.env.example config.env
    echo 📝 Please update config.env with your settings
)

REM Start backend
echo 🔧 Starting backend...
start /B python unified_backend.py

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend (if built)
if exist "dist" (
    echo 🌐 Starting frontend...
    start /B npx serve -s dist -l 3000
    echo ✅ Frontend running on http://localhost:3000
)

echo ✅ Backend running on http://localhost:8000
echo 📖 API docs: http://localhost:8000/docs
echo.
echo Press any key to stop all services
pause >nul
