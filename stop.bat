@echo off
echo Stopping Queue Detection System...
echo.

echo Killing Node.js server (Port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Killing Python Detector (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Killing Ngrok...
taskkill /F /IM ngrok.exe >nul 2>&1

echo.
echo All services stopped.
pause
