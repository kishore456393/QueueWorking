# Quick Setup Guide

## For Windows Users

### One-Click Start (Recommended)
1. Double-click `start.bat`
2. Wait for services to start
3. Browser will open automatically

### Manual Start
```powershell
# Terminal 1 - Python Detector
.\.venv\Scripts\Activate.ps1
python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Node Server
npm run dev
```

## For macOS/Linux Users

### One-Click Start (Recommended)
```bash
chmod +x start.sh
./start.sh
```

### Manual Start
```bash
# Terminal 1 - Python Detector
source .venv/bin/activate
python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Node Server
npm run dev
```

## First Time Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Create Python virtual environment:**
   ```bash
   python -m venv .venv
   ```

3. **Install Python dependencies:**
   ```bash
   # Windows
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt

   # macOS/Linux
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Run the application:**
   - Windows: Double-click `start.bat`
   - macOS/Linux: Run `./start.sh`

## Access Points

- **Main Application**: http://localhost:5000
- **Python Detector API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Python Virtual Environment Issues
```powershell
# Windows: Enable scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Dependencies Not Installing
```bash
# Update pip
python -m pip install --upgrade pip

# Clear npm cache
npm cache clean --force
npm install
```

For detailed documentation, see [README.md](README.md)
