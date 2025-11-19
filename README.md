# 🎯 AI Queue Detection & Management System

An intelligent real-time queue monitoring and management system that uses AI to detect people in queues, provide smart recommendations, and announce queue status in multiple languages.

## ✨ Features

### 🤖 AI-Powered Detection
- **YOLOv8 Person Detection**: Real-time person detection using state-of-the-art deep learning
- **Multi-Queue Support**: Monitor multiple queues simultaneously with custom zone definitions
- **Smart Recommendations**: Intelligent queue suggestions based on:
  - Queue length differences
  - Predicted wait time savings (2 min per person)
  - Physical proximity between queues

### 🗣️ Multi-Language Audio Announcements
- **10 Languages Supported**: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi
- **Google TTS Integration**: Reliable, high-quality text-to-speech
- **Male Voice**: Optimized for clear public announcements
- **Configurable Intervals**: Set custom announcement frequency (default: 30 seconds)
- **Smart Overlap Prevention**: Prevents multiple announcements from playing simultaneously

### 📊 Real-Time Dashboard
- **Live Queue Monitoring**: See real-time people count in each queue
- **Visual Analytics**: Bar charts and trend visualization
- **Annotated Video Feed**: Visual representation of detected persons and queue zones
- **Language Switching**: Instantly switch dashboard language
- **Queue Recommendations**: See which queue is fastest and time savings

### 🔒 Privacy & Compliance
- **Auto-Cleanup**: Detection data automatically deleted after 1 hour
- **GDPR Compliant**: Full privacy protection and data retention policies
- **Edge Computing**: Video processing happens locally on your server
- **No Cloud Storage**: All data processed and stored locally

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface built with React and Tailwind CSS
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode Support**: Comfortable viewing in any environment
- **Real-Time Updates**: Live data refresh with configurable intervals

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite for fast development
- TanStack Query for data management
- Recharts for analytics visualization
- Shadcn/ui components
- Tailwind CSS for styling

**Backend:**
- Node.js + Express
- TypeScript
- SQLite database with Drizzle ORM
- WebSocket support for real-time updates

**AI/ML:**
- Python FastAPI server
- YOLOv8 (Ultralytics) for person detection
- OpenCV for video processing
- Google TTS (gTTS) for speech synthesis

### Algorithms Used

**AI Algorithms:**
1. **YOLOv8 CNN** - Real-time person detection from video frames
2. **Neural TTS** - Google's text-to-speech synthesis

**Classical Algorithms:**
1. **Ray Casting** - Point-in-polygon detection for zone assignment
2. **Centroid Calculation** - Finding center point of queue polygons
3. **Euclidean Distance** - Calculating proximity between queues
4. **Multi-factor Recommendation** - Smart queue suggestions
5. **Bounding Box Center** - Calculating person position
6. **Interval Scheduling** - Periodic detection and announcements
7. **Auto-cleanup** - Privacy-compliant data retention

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.8+
- **FFmpeg** (for video processing)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/kishore456393/QueueWorking.git
cd QueueWorking
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Install Python dependencies:**
```bash
pip install -r detector/requirements.txt
```

4. **Download YOLO model:**
The YOLOv8 model is included in the repository. If needed, it will download automatically on first run.

### Running the Application

**Option 1: Using Start Scripts (Recommended)**

**Windows:**
```bash
start-servers.ps1
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Option 2: Manual Start**

**Terminal 1 - Backend Server:**
```bash
npm run dev
```

**Terminal 2 - Python Detector:**
```bash
cd detector
python main.py
```

**Access the application:**
- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api
- Python Detector: http://localhost:8000

## 📖 Usage Guide

### 1. Setup Queue Zones

1. Navigate to **Setup** page
2. Upload a video file or start live camera feed
3. Click on the video to define queue zones (polygons)
4. Save the queue zones

### 2. Start Detection

1. Go to **Dashboard** page
2. Select your video/camera feed
3. Click "Start Detection"
4. View real-time queue counts and recommendations

### 3. Configure Audio Announcements

1. In Dashboard, enable "Audio Announcements"
2. Select your preferred language
3. Set announcement interval (default: 30 seconds)
4. Audio will automatically announce queue status

### 4. View Analytics

1. Navigate to **Analytics** page
2. View historical queue data
3. Analyze trends and patterns
4. Export data for further analysis

## 🎯 Use Cases

- **Retail Stores**: Manage checkout queues efficiently
- **Banks**: Optimize customer service queues
- **Airports**: Monitor security and check-in lines
- **Hospitals**: Manage patient waiting areas
- **Theme Parks**: Reduce wait times at attractions
- **Government Offices**: Improve citizen service delivery

## 🔧 Configuration

### Settings (via Dashboard)

- **Detection Interval**: How often to run detection (default: 2 seconds)
- **Audio Announcements**: Enable/disable voice announcements
- **Audio Interval**: Announcement frequency (default: 30 seconds)
- **Language**: Select from 10 supported languages
- **Confidence Threshold**: YOLO detection confidence (default: 0.04-0.07)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
DATABASE_URL=./database.db

# Python Detector
DETECTOR_PORT=8000
DETECTOR_HOST=127.0.0.1

# Privacy Settings
DATA_RETENTION_HOURS=1
CLEANUP_INTERVAL_MINUTES=5
```

## 📊 API Documentation

### Backend API Endpoints

**Videos:**
- `GET /api/videos` - List all videos
- `POST /api/videos` - Upload new video
- `GET /api/videos/:id` - Get video details
- `DELETE /api/videos/:id` - Delete video

**Queue Zones:**
- `GET /api/queue-zones` - List all zones
- `POST /api/queue-zones` - Create queue zone
- `PUT /api/queue-zones/:id` - Update zone
- `DELETE /api/queue-zones/:id` - Delete zone

**Detection:**
- `POST /api/detection/start` - Start detection
- `POST /api/detection/stop` - Stop detection
- `GET /api/detection/latest` - Get latest snapshot
- `GET /api/detection/history` - Get detection history

**Settings:**
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings

### Python Detector API

**Detection:**
- `POST /detect` - Run person detection on frame
  ```json
  {
    "image_b64": "base64_encoded_image",
    "polygons": [[{"x": 100, "y": 200}, ...]],
    "conf": 0.07
  }
  ```

**TTS:**
- `POST /tts` - Generate speech audio
  ```json
  {
    "text": "Queue 1 is fastest",
    "language": "en"
  }
  ```

## 🔒 Privacy & Security

See [PRIVACY.md](PRIVACY.md) for complete privacy documentation.

**Key Features:**
- ✅ 1-hour automatic data deletion
- ✅ No personal data storage
- ✅ Local video processing
- ✅ GDPR compliant
- ✅ Configurable retention policies
- ✅ Audit logging

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ultralytics YOLOv8** - Person detection model
- **Google TTS** - Text-to-speech synthesis
- **OpenCV** - Video processing
- **React** - Frontend framework
- **Shadcn/ui** - UI components

## 📧 Contact

**Project Maintainer:** kishore456393

**Repository:** [github.com/kishore456393/QueueWorking](https://github.com/kishore456393/QueueWorking)

## 🐛 Troubleshooting

### Common Issues

**1. Python server won't start:**
```bash
# Make sure Python dependencies are installed
pip install -r detector/requirements.txt

# Check if port 8000 is available
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Linux/Mac
```

**2. Audio not playing:**
- Check browser console for errors
- Verify Python TTS service is running
- Ensure gTTS is installed: `pip install gtts`

**3. Detection not working:**
- Verify YOLO model exists in `detector/yolov8n.pt`
- Check confidence threshold (try 0.04-0.10)
- Ensure FFmpeg is installed for video processing

**4. Video upload fails:**
- Check `uploads/` directory exists and is writable
- Verify video format (MP4, AVI, MOV supported)
- Check file size limits in `server/routes.ts`

## 🔄 Updates & Changelog

### Latest Version (v1.0.0)

**New Features:**
- ✨ Multi-language TTS with 10 languages
- 🎤 Male voice selection for announcements
- 🔒 Privacy manager with auto-cleanup
- 🧠 Smart queue recommendations
- 🎯 Point-in-polygon zone detection
- 📊 Real-time analytics dashboard

**Bug Fixes:**
- Fixed audio overlapping issues
- Improved language switching
- Better interval timing
- Enhanced error handling

**Performance:**
- Optimized YOLO detection speed
- Reduced memory usage
- Faster video processing

---

Made with ❤️ for better queue management