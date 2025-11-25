@echo off
setlocal enabledelayedexpansion
title Queue Detection System - Starting All Services
color 0A

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║        QUEUE DETECTION SYSTEM - FULL STARTUP                  ║
echo  ║                                                               ║
echo  ║        Starting Backend + Frontend + Python Detector          ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Check if running from correct directory
if not exist "package.json" (
    color 0C
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

REM Kill any existing processes on ports 5000 and 8000
echo [CLEANUP] Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo   - Killing process on port 5000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo   - Killing process on port 8000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
echo   ✓ Ports cleared
echo.

REM Check Node.js installation
echo [CHECK] Verifying Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo   ✓ Node.js !NODE_VERSION! detected
echo.

REM Check Python installation
echo [CHECK] Verifying Python installation...
where python >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do set PYTHON_VERSION=%%v
echo   ✓ !PYTHON_VERSION! detected
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install Node.js dependencies!
        pause
        exit /b 1
    )
    echo   ✓ Dependencies installed
    echo.
)

REM Start Node.js backend server
echo ═══════════════════════════════════════════════════════════════
echo [1/3] STARTING NODE.JS BACKEND + FRONTEND SERVER
echo ═══════════════════════════════════════════════════════════════
echo   Port: 5000
echo   Opening in new window...
start "Queue System - Backend Server" cmd /k "color 0B && title Queue System - Backend Server && npm run dev"
timeout /t 3 /nobreak >nul
echo   ✓ Backend server started
echo.

REM Start Python detector
echo ═══════════════════════════════════════════════════════════════
echo [2/3] STARTING PYTHON DETECTION ENGINE
echo ═══════════════════════════════════════════════════════════════
echo   Port: 8000
echo   Opening in new window...
start "Queue System - Python Detector" cmd /k "color 0E && title Queue System - Python Detector && cd detector && python main.py"
timeout /t 5 /nobreak >nul
echo   ✓ Detection engine started
echo.

REM Wait for servers to initialize
echo [WAIT] Initializing all services...
timeout /t 5 /nobreak >nul
echo   ✓ Services initialized
echo.

REM Start Ngrok tunnel
echo ═══════════════════════════════════════════════════════════════
echo [3/4] STARTING NGROK TUNNEL
echo ═══════════════════════════════════════════════════════════════
echo   Checking for Ngrok...
where ngrok >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Ngrok found, starting tunnel...
    start "Queue System - Ngrok Tunnel" cmd /k "color 0D && title Queue System - Ngrok Tunnel && ngrok http 5000"
    timeout /t 3 /nobreak >nul
    echo   ✓ Ngrok tunnel started
    echo   Visit http://127.0.0.1:4040 to see your public URL
echo.
) else (
    echo   ⚠ Ngrok not found - skipping tunnel
    echo   Run setup-ngrok.bat to install Ngrok for internet access
    echo.
)

REM Open web application
echo ═══════════════════════════════════════════════════════════════
echo [4/4] LAUNCHING WEB APPLICATION
echo ═══════════════════════════════════════════════════════════════
start http://localhost:5000
echo   ✓ Browser opened
echo.

REM Display success information
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║                  ✓ ALL SYSTEMS OPERATIONAL                    ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo  📊 SYSTEM URLS:
echo  ════════════════════════════════════════════════════════════════
echo    • Web Interface:     http://localhost:5000
echo    • Backend API:       http://localhost:5000/api
echo    • Python Detector:   http://localhost:8000
echo    • Mobile Dashboard:  http://localhost:5000/mobile-live
echo    • Ngrok Dashboard:   http://127.0.0.1:4040
echo.
echo  🌍 INTERNET ACCESS:
echo  ════════════════════════════════════════════════════════════════
where ngrok >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Ngrok tunnel is running!
    echo    Open http://127.0.0.1:4040 to see your public URL
    echo    Share the public URL to access from anywhere
) else (
    echo    ⚠ Ngrok not installed
    echo    Run setup-ngrok.bat to enable internet access
)
echo.
echo  🔧 QUICK ACTIONS:
echo  ════════════════════════════════════════════════════════════════
echo    • To stop servers:   Run stop.bat or close terminal windows
echo    • To restart:        Run this script again
echo    • View public URL:   Open http://127.0.0.1:4040
echo.
echo  💡 TIP: Generate QR code in dashboard - it will auto-detect
echo      your Ngrok URL for worldwide mobile access!
echo.
echo  ════════════════════════════════════════════════════════════════
echo  Press any key to close this launcher...
echo  (Servers will continue running in separate windows)
echo  ════════════════════════════════════════════════════════════════
pause >nul
