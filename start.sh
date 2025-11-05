#!/bin/bash

echo "========================================"
echo "Queue Management System - Startup"
echo "========================================"
echo ""

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    echo "Virtual environment created."
fi

echo ""
echo "Activating Python virtual environment..."
source .venv/bin/activate

echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "========================================"
echo "Starting Python Detector Service..."
echo "========================================"
echo "Service will run on http://127.0.0.1:8000"
echo ""

# Start Python detector in background
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && source .venv/bin/activate && python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload"' 2>/dev/null || \
gnome-terminal -- bash -c "cd $(pwd) && source .venv/bin/activate && python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload; exec bash" 2>/dev/null || \
xterm -e "cd $(pwd) && source .venv/bin/activate && python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload" 2>/dev/null &

sleep 3

echo ""
echo "========================================"
echo "Starting Node.js Backend + Frontend..."
echo "========================================"
echo "Application will run on http://localhost:5000"
echo ""

# Start Node.js server in new terminal
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"' 2>/dev/null || \
gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash" 2>/dev/null || \
xterm -e "cd $(pwd) && npm run dev" 2>/dev/null &

echo ""
echo "========================================"
echo "Services are starting..."
echo ""
echo "Python Detector: http://127.0.0.1:8000"
echo "Application: http://localhost:5000"
echo ""
echo "Opening browser in 5 seconds..."
sleep 5

# Open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:5000
elif command -v open > /dev/null; then
    open http://localhost:5000
else
    echo "Please open http://localhost:5000 in your browser"
fi

echo ""
echo "Press Ctrl+C to stop this script (services will continue running)"
echo ""

# Keep script running
wait
