@echo off
echo ========================================
echo Starting QueueGuidance Backend Services
echo ========================================
echo.

REM Start Python Detector
echo Starting Python YOLO Detector (Port 8000)...
start "Python Detector" cmd /k "cd detector && python -m uvicorn main:app --host 127.0.0.1 --port 8000"
timeout /t 5 /nobreak > nul

REM Start Node.js Server
echo Starting Node.js Server (Port 5000)...
start "Node.js Server" cmd /k "npx tsx server/index.ts"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo Both servers are starting...
echo Check the opened windows for status
echo ========================================
echo.
pause
