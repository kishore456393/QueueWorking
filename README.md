# Queue Management System - Real-Time Detection & Analytics

An intelligent queue management system that uses YOLOv8 for real-time people detection, providing analytics and recommendations for optimal service. Features multi-language support with neural voice announcements via Edge TTS.

## 🌟 Features

- **Real-Time People Detection**: YOLOv8-based person detection with bounding boxes
- **Multi-Queue Management**: Draw and manage multiple queue zones on video feeds
- **Live Analytics Dashboard**: Real-time queue statistics with WebSocket updates
- **Multi-Language Support**: 10 languages (English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi)
- **Audio Announcements**: Automatic queue updates using Edge TTS neural voices
- **Visual Detection Frames**: See detection results with bounding boxes and queue assignments
- **Customizable Intervals**: Configure refresh rates and announcement frequencies
- **Responsive UI**: Modern, accessible interface with Tailwind CSS and shadcn/ui

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://www.python.org/)
- **Git** (optional, for cloning) - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone or Download the Repository

```bash
git clone <repository-url>
cd ArtistryEdu
```

Or download and extract the ZIP file.

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Set Up Python Environment

#### On Windows (PowerShell):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### On macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Download YOLO Model (Optional)

The system will automatically download YOLOv8n on first run. For better accuracy, you can use YOLOv8m:

```bash
# Place your model in: attached_assets/yolov8m_1762262649284.pt
```

### 5. Start the Application

#### Option A: Start Everything at Once (Recommended)

**On Windows (PowerShell):**
```powershell
# Terminal 1 - Start Python Detector
.\.venv\Scripts\Activate.ps1
python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Start Node Server (in a new terminal)
npm run dev
```

**On macOS/Linux:**
```bash
# Terminal 1 - Start Python Detector
source .venv/bin/activate
python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Start Node Server (in a new terminal)
npm run dev
```

#### Option B: Start Services Separately

1. **Python Detector Service** (Port 8000)
   ```bash
   python -m uvicorn detector.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Node.js Backend + Frontend** (Port 5000)
   ```bash
   npm run dev
   ```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## 📁 Project Structure

```
ArtistryEdu/
├── client/                    # React Frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and translations
│   │   │   ├── translations.ts  # Multi-language support
│   │   │   ├── tts.ts          # Text-to-speech helper
│   │   │   └── utils.ts        # Common utilities
│   │   ├── pages/           # Application pages
│   │   │   ├── home.tsx         # Landing page
│   │   │   ├── setup.tsx        # Video upload & zone drawing
│   │   │   ├── dashboard.tsx    # Live analytics
│   │   │   └── analytics.tsx    # Historical data
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── index.html           # HTML template
│
├── server/                    # Express.js Backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # In-memory data storage
│   ├── detection-yolo.ts     # YOLO detection integration
│   ├── detection-mock.ts     # Mock detection (fallback)
│   └── vite.ts               # Vite dev middleware
│
├── detector/                  # Python Detection Service
│   ├── __init__.py           # Package initializer
│   ├── main.py               # FastAPI server
│   └── tts_service.py        # Edge TTS integration
│
├── shared/                    # Shared TypeScript types
│   └── schema.ts             # Database schemas and types
│
├── uploads/                   # Uploaded videos (created automatically)
├── .venv/                     # Python virtual environment
├── node_modules/              # Node.js dependencies
│
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── README.md                 # This file
```

## 🎯 Usage Guide

### 1. Setup Page (http://localhost:5000/setup)

1. **Upload a Video**:
   - Click "Choose Video File"
   - Select an MP4, AVI, MOV, MKV, or WebM file
   - Click "Upload Video"

2. **Draw Queue Zones**:
   - Left-click on the video frame to add points
   - Right-click to complete the polygon
   - Click "Save Queue X" to save
   - Repeat for multiple queues

### 2. Dashboard Page (http://localhost:5000/dashboard)

- **Select Active Video**: Choose from uploaded videos
- **View Real-Time Stats**:
  - Total People across all queues
  - Best Queue (shortest wait)
  - Busiest Queue (longest wait)
- **See Detection Frame**: Visual confirmation with bounding boxes
- **Configure Settings**:
  - Auto Refresh Interval (1-60 seconds)
  - Language Selection (10 languages)
  - Audio Announcements (toggle on/off)
  - Audio Announcement Interval (10-300 seconds)

### 3. Analytics Page (http://localhost:5000/analytics)

- View historical data
- Compare queue performance over time

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):

```env
PORT=5000
DETECTOR_URL=http://127.0.0.1:8000
```

### Adjusting Detection Settings

Edit `detector/main.py` to change:
- **Confidence Threshold**: Line ~90 (default: 0.04)
- **Model Path**: Line ~20 (use different YOLO model)

### Language Support

Add more languages in `client/src/lib/translations.ts`

## 🛠️ Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000  # Windows
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

**2. Python Virtual Environment Not Activating**
```powershell
# Windows: Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**3. YOLO Model Not Found**
- The system will auto-download YOLOv8n on first run
- Ensure stable internet connection
- Alternatively, manually download and place in `attached_assets/`

**4. Audio Not Working**
- Check browser permissions for audio
- Ensure Edge TTS is installed: `pip list | grep edge-tts`
- Reinstall: `pip install --upgrade edge-tts`

**5. CORS Errors**
- Ensure both servers are running
- Python detector: `http://127.0.0.1:8000`
- Node backend: `http://localhost:5000`

## 📦 Dependencies

### Node.js (Frontend & Backend)
- **Framework**: Express.js, React, Vite
- **UI**: Tailwind CSS, shadcn/ui, Lucide icons
- **State Management**: TanStack Query (React Query)
- **WebSocket**: ws
- **Video Processing**: multer, ffmpeg-static

### Python (Detection Service)
- **Framework**: FastAPI, Uvicorn
- **Detection**: Ultralytics (YOLOv8)
- **Image Processing**: OpenCV (cv2), Pillow, NumPy
- **TTS**: edge-tts, aiofiles

## 🌐 API Endpoints

### Backend (Node.js - Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/videos` | Upload video |
| GET | `/api/videos` | List all videos |
| GET | `/api/videos/:id` | Get video details |
| POST | `/api/queue-zones` | Create queue zone |
| GET | `/api/queue-zones` | List queue zones |
| POST | `/api/detection/start/:videoId` | Start detection |
| POST | `/api/detection/stop/:videoId` | Stop detection |
| GET | `/api/detection/snapshot/:videoId` | Get latest detection |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| WebSocket | `/ws` | Real-time updates |

### Detector (Python - Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/detect` | Run YOLO detection on frame |
| POST | `/tts` | Convert text to speech |

## 🎨 Customization

### Changing Detection Threshold
Edit `detector/main.py`:
```python
CONF_THRESHOLD = 0.04  # Adjust between 0.01 and 1.0
```

### Adding New Languages
1. Add translations in `client/src/lib/translations.ts`
2. Add voice mapping in `detector/tts_service.py`
3. Update language selector in dashboard

### Modifying UI Theme
Edit `client/src/index.css` for colors and styles
Edit `tailwind.config.ts` for theme configuration

## 📝 Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run start
```

### Type Checking
```bash
npm run check
```

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the Troubleshooting section
- Review closed issues on GitHub
- Create a new issue with detailed information

## 🔮 Future Enhancements

- [ ] Live RTSP camera feed support
- [ ] Database persistence (PostgreSQL)
- [ ] User authentication
- [ ] Multi-camera support
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Email/SMS notifications
- [ ] Dark mode support
- [ ] Export data to CSV/PDF

## 📊 System Requirements

### Minimum
- CPU: Dual-core 2.0 GHz
- RAM: 4 GB
- Storage: 2 GB free space
- OS: Windows 10, macOS 10.15, Ubuntu 18.04

### Recommended
- CPU: Quad-core 2.5 GHz or better
- RAM: 8 GB or more
- Storage: 10 GB free space (for videos)
- GPU: NVIDIA GPU with CUDA support (optional, for faster detection)

## 🎓 Credits

- **YOLOv8**: Ultralytics
- **Edge TTS**: Microsoft Edge Text-to-Speech
- **UI Components**: shadcn/ui
- **Icons**: Lucide Icons

---

**Version**: 1.0.0  
**Last Updated**: November 2025

**Happy Queue Managing! 🎉**
