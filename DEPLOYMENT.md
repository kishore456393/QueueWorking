# 🚀 Deployment Guide - Queue Detection System

This guide will help you set up and run the Queue Detection System on a fresh laptop/computer.

## 📋 Prerequisites Checklist

Before you begin, ensure you have these installed:

- [ ] **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- [ ] **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- [ ] **Git** - [Download](https://git-scm.com/downloads)
- [ ] **FFmpeg** - [Download](https://ffmpeg.org/download.html)

### Installing FFmpeg

**Windows:**
1. Download from https://github.com/BtbN/FFmpeg-Builds/releases
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to System PATH
4. Verify: `ffmpeg -version`

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

## 📥 Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/kishore456393/QueueWorking.git
cd QueueWorking
```

## 🔧 Step 2: Install Dependencies

### Node.js Dependencies

```bash
# Install all Node.js packages
npm install
```

This will install:
- Express server
- React frontend
- Database tools
- All UI components

### Python Dependencies

```bash
# Navigate to detector folder
cd detector

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Return to root directory
cd ..
```

## 📁 Step 3: Verify File Structure

Ensure these files exist:

```
QueueWorking/
├── client/                 # Frontend React app
├── server/                 # Backend Express server
├── detector/               # Python AI detection
│   ├── main.py
│   ├── tts_service.py
│   ├── requirements.txt
│   └── yolov8n.pt         # YOLO model (included)
├── uploads/                # Video storage (auto-created)
├── package.json
├── start-servers.ps1       # Windows start script
├── start.sh                # Linux/Mac start script
└── README.md
```

## ▶️ Step 4: Run the Application

### Option 1: Using Start Scripts (Easiest)

**Windows PowerShell:**
```powershell
# Allow script execution (run once as admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the application
.\start-servers.ps1
```

**Linux/Mac:**
```bash
# Make script executable
chmod +x start.sh

# Run the application
./start.sh
```

### Option 2: Manual Start (Advanced)

**Terminal 1 - Backend Server:**
```bash
npm run dev
```
Server will start on: http://localhost:5000

**Terminal 2 - Python Detector:**
```bash
cd detector
python main.py
```
Detector will start on: http://localhost:8000

## 🌐 Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

You should see the Queue Detection dashboard!

## ✅ Step 6: Verify Installation

### Test Backend Server
```bash
curl http://localhost:5000/api/settings
```
Should return JSON with settings.

### Test Python Detector
```bash
curl http://localhost:8000/health
```
Should return: `{"status": "healthy"}`

### Test Frontend
Open http://localhost:5000 in browser - you should see the dashboard.

## 🎯 Quick Start Usage

1. **Upload Video:**
   - Go to "Setup" page
   - Click "Upload Video"
   - Select a video file with people in queues

2. **Define Queue Zones:**
   - Click on the video to create polygon points
   - Define multiple queue areas
   - Click "Save Zones"

3. **Start Detection:**
   - Go to "Dashboard" page
   - Select your video
   - Click "Start Detection"
   - Watch real-time queue counts!

4. **Enable Audio:**
   - Toggle "Audio Announcements"
   - Select your language
   - Hear queue updates automatically

## 🔧 Configuration

### Database Setup
The SQLite database is created automatically on first run at:
```
./database.db
```

### Uploads Directory
Videos are stored in:
```
./uploads/
```

### Environment Variables (Optional)

Create `.env` file in root directory:
```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=./database.db

# Python Detector
DETECTOR_PORT=8000

# Privacy
DATA_RETENTION_HOURS=1
CLEANUP_INTERVAL_MINUTES=5
```

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Detector (Port 8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Issue: Python Dependencies Fail

```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies again
pip install -r detector/requirements.txt

# If still fails, install one by one:
pip install fastapi uvicorn opencv-python numpy ultralytics gtts
```

### Issue: YOLO Model Not Found

The model should be included. If missing:
```bash
cd detector
# Model will auto-download on first run
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Issue: FFmpeg Not Found

**Verify FFmpeg:**
```bash
ffmpeg -version
```

If not found, reinstall FFmpeg and ensure it's in your system PATH.

### Issue: Audio Not Playing

1. Check Python detector is running on port 8000
2. Verify gTTS is installed: `pip install gtts`
3. Check browser console for errors
4. Try refreshing the page

### Issue: Video Upload Fails

1. Ensure `uploads/` directory exists and is writable
2. Check video format (MP4, AVI, MOV supported)
3. Verify file size is reasonable (< 500MB recommended)

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update Node dependencies
npm install

# Update Python dependencies
cd detector
pip install -r requirements.txt --upgrade
cd ..

# Restart servers
```

## 📦 Building for Production

### Build Frontend
```bash
npm run build
```
Creates optimized build in `dist/` folder.

### Run Production Server
```bash
npm start
```

## 🔒 Security Considerations

1. **Change default ports** if running on public network
2. **Enable HTTPS** for production deployment
3. **Set up firewall rules** to restrict access
4. **Regular backups** of database and videos
5. **Update dependencies** regularly for security patches

## 🌐 Network Deployment

To access from other devices on your network:

1. **Find your IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. **Update server binding:**
   In `server/index.ts`, change:
   ```typescript
   app.listen(5000, '0.0.0.0', () => {
     console.log('Server running on http://0.0.0.0:5000');
   });
   ```

3. **Access from other devices:**
   ```
   http://YOUR_IP_ADDRESS:5000
   ```

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review logs in terminal windows
3. Check GitHub issues: https://github.com/kishore456393/QueueWorking/issues
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - System information (OS, Node version, Python version)

## ✅ Post-Installation Checklist

- [ ] All dependencies installed successfully
- [ ] Backend server starts without errors (port 5000)
- [ ] Python detector starts without errors (port 8000)
- [ ] Can access dashboard at http://localhost:5000
- [ ] Can upload video files
- [ ] Can define queue zones
- [ ] Detection runs and shows results
- [ ] Audio announcements work
- [ ] Can switch languages

Congratulations! 🎉 Your Queue Detection System is ready to use!

---

**Quick Reference Commands:**

```bash
# Start everything (Windows)
.\start-servers.ps1

# Start everything (Linux/Mac)
./start.sh

# Stop everything
Ctrl + C (in each terminal)

# Update from GitHub
git pull origin main
npm install
cd detector && pip install -r requirements.txt
```
