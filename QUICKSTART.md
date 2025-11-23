# 🎯 Quick Start Guide

Get the Queue Detection System running on your computer in 5 minutes!

## ⚡ One-Command Setup

### Windows
```powershell
git clone https://github.com/kishore456393/QueueWorking.git && cd QueueWorking && .\setup.ps1 && .\start-servers.ps1
```

### Linux/Mac
```bash
git clone https://github.com/kishore456393/QueueWorking.git && cd QueueWorking && chmod +x setup.sh && ./setup.sh && ./start.sh
```

## 📋 Prerequisites

Before running the setup, install these:

1. **Node.js** - https://nodejs.org/ (v18+)
2. **Python** - https://www.python.org/ (v3.8+)
3. **FFmpeg** - https://ffmpeg.org/download.html

## 🚀 Step-by-Step

### 1. Get the Code
```bash
git clone https://github.com/kishore456393/QueueWorking.git
cd QueueWorking
```

### 2. Run Setup

**Windows:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

This will:
- ✅ Check all prerequisites
- ✅ Install Node.js dependencies
- ✅ Create Python virtual environment
- ✅ Install Python dependencies
- ✅ Download YOLO model
- ✅ Create necessary folders

### 3. Start Application

**Windows:**
```powershell
.\start-servers.ps1
```

**Linux/Mac:**
```bash
./start.sh
```

### 4. Open Browser

Navigate to: **http://localhost:5000**

## 🎉 You're Ready!

Now you can:
1. Upload a video or use live camera
2. Define queue zones by clicking on video
3. Start detection
4. Watch real-time queue counts
5. Enable audio announcements in your language

## 📖 Need More Help?

- **Full Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Troubleshooting**: [DEPLOYMENT.md#troubleshooting](DEPLOYMENT.md#troubleshooting)
- **Configuration**: [README.md#configuration](README.md#configuration)

## 🐛 Common Issues

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Python dependencies fail?**
```bash
python -m pip install --upgrade pip
pip install -r detector/requirements.txt
```

**Can't find FFmpeg?**
Make sure FFmpeg is installed and added to your system PATH.

---

**🎯 Ready to Deploy on Another Computer?**

Just copy the entire `QueueWorking` folder to the new computer and run:
- Windows: `.\setup.ps1`
- Linux/Mac: `./setup.sh`

All dependencies will be installed automatically!
