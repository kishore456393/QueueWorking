@echo off
echo ========================================
echo Queue Management System - Startup
echo ========================================
echo.

echo Checking Python virtual environment...
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
    echo Virtual environment created.
)

echo.
echo Activating Python virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Installing Python dependencies...
pip install -r requirements.txt --quiet

echo.
echo ========================================
echo Starting Python Detector Service...
echo ========================================
echo Service will run on http://127.0.0.1:8000
echo.
start cmd /k "title Python Detector Service && .venv\Scripts\activate && python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo Starting Node.js Backend + Frontend...
echo ========================================
echo Application will run on http://localhost:5000
echo.
start cmd /k "title Node.js Server && npm run dev"

echo.
echo ========================================
echo Services are starting...
echo.
echo Python Detector: http://127.0.0.1:8000
echo Application: http://localhost:5000
echo.
echo Press any key to open browser...
pause > nul
start http://localhost:5000
