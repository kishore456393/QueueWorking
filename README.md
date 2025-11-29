# 🎯 QueueGuidance - AI Queue Detection & Management System

3. Click "Start Detection"
4. View real-time queue counts

### 3. Mobile Access

**Local Network (Same WiFi):**
1. Click **"Show QR Code"** in Dashboard
2. Toggle to "Local Network" mode
3. Scan QR code with mobile device
4. View live updates on mobile

**Internet Access (Any Network):**
1. Run `start-all.bat` (includes Ngrok)
2. Click **"Show QR Code"** in Dashboard  
3. Ngrok URL detected automatically
4. Toggle to "Public URL" mode
5. Scan QR code from anywhere in the world!

### 4. Configure Settings

- **Language**: Choose from 10 languages
- **Audio Announcements**: Enable voice announcements
- **Intervals**: Set detection and audio frequency
- **Confidence**: Adjust AI detection sensitivity

## 🌐 Internet Deployment

The system includes built-in Ngrok support for worldwide access:

1. **Get Ngrok Auth Token**: Visit [dashboard.ngrok.com](https://dashboard.ngrok.com)
2. **Configure Ngrok**: Run `start-all.bat` (will prompt if not configured)
3. **Auto-Detection**: QR code automatically shows public URL
4. **Share Access**: Anyone can scan QR code from anywhere

**Features:**
- ✅ Automatic Ngrok tunnel startup
- ✅ Public URL auto-detection in QR code
- ✅ Toggle between local and public URLs
- ✅ Secure WSS (WebSocket Secure) for HTTPS

## 🏗️ Technology Stack

**Frontend:**
- OpenCV + Google TTS

**Deployment:**
- Ngrok for public tunneling
- Automated batch scripts

## 📊 API Endpoints

### Backend (Port 5000)

- `GET /api/videos` - List videos
- `POST /api/videos` - Upload video
- `POST /api/detection/start` - Start detection
- `POST /api/detection/stop` - Stop detection
- `GET /api/detection/latest` - Latest snapshot
- `GET /api/network-ip` - Get network IP
- `GET /api/ngrok-tunnels` - Get Ngrok URL

### Python Detector (Port 8000)

- `POST /detect` - Run YOLOv8 detection
- `POST /tts` - Generate speech audio

## 🎯 Use Cases

- 🏪 **Retail**: Checkout queue management
- 🏦 **Banks**: Customer service optimization  
- ✈️ **Airports**: Security line monitoring
- 🏥 **Hospitals**: Patient waiting areas
- 🎢 **Theme Parks**: Attraction queue times
- 🏛️ **Government**: Public service counters
- Detection interval: 2-10 seconds
- Audio interval: 10-60 seconds  
- Language selection
- Confidence threshold: 0.04-0.10

## 🐛 Troubleshooting

**Ngrok not detected:**
- Check `start-all.bat` terminal for Ngrok status
- Visit http://127.0.0.1:4040 to verify tunnel
- Click "Refresh" in QR code dialog

**Mobile access not working:**
- Ensure Ngrok is running
- Click "Visit Site" on Ngrok warning page
- Check firewall settings

**WebSocket errors:**
- System auto-detects ws:// vs wss://
- Check browser console for errors
- Verify ports 5000 and 8000 are open

**Live Camera Issues:**
- **"Connecting..." hangs:** Ensure no other process is using the camera. Restart the app.
- **Public Streams fail:** Many public RTSP/MJPEG streams are unreliable. Use a local webcam (Source `0`) or a video file for testing.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Submit pull request

## 📝 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Ultralytics YOLOv8
- Google TTS
- OpenCV
- React + Shadcn/ui

## 📧 Contact

**Maintainer:** kishore456393  
**Repository:** [github.com/kishore456393/QueueWorking](https://github.com/kishore456393/QueueWorking)

---

Made with ❤️ for smarter queue management
```powershell
# Clone the repository
git clone https://github.com/kishore456393/QueueWorking.git
cd QueueWorking

# Run automated setup
.\setup.ps1

# Start the application
.\start-servers.ps1
```

**Linux/Mac:**
```bash
# Clone the repository
git clone https://github.com/kishore456393/QueueWorking.git
cd QueueWorking

# Run automated setup
chmod +x setup.sh
./setup.sh

# Start the application
./start.sh
```

### Manual Installation

**1. Clone the repository:**
```bash
git clone https://github.com/kishore456393/QueueWorking.git
cd QueueWorking
```

**2. Install Node.js dependencies:**
```bash
npm install
```

**3. Install Python dependencies:**
```bash
cd detector
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

**4. Run the application:**

**Windows:**
```powershell
.\start-servers.ps1
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Access the application:**
- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api
- Python Detector: http://localhost:8000

## 📖 Full Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for fresh installations
- **[PRIVACY.md](PRIVACY.md)** - Privacy and GDPR compliance documentation
- **[SETUP.md](SETUP.md)** - Detailed setup instructions

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

### 5. Access on Mobile Device

1. **Ensure both devices are on the same WiFi network**
2. In Dashboard, click **"Show QR Code"** button
3. Scan the QR code with your phone's camera
4. Tap the notification to open mobile dashboard
5. View live updates on your mobile device

**Troubleshooting Mobile Access:**
- Make sure your phone and computer are on the same WiFi network
- Check your firewall isn't blocking port 5000
- The QR code shows your network IP (e.g., 192.168.1.x:5000)
- You can also manually type the URL shown in the QR dialog
- **For internet access from any device:** See [INTERNET-DEPLOYMENT.md](INTERNET-DEPLOYMENT.md)

## 🌐 Deploy to Internet

Want to access from anywhere, not just your local WiFi?

See the complete guide: **[INTERNET-DEPLOYMENT.md](INTERNET-DEPLOYMENT.md)**

**Quick options:**
- **Ngrok** (5 minutes) - Free, instant public URL
- **Cloudflare Tunnel** (Free forever) - Permanent URL
- **VPS Hosting** ($5/month) - Professional 24/7 deployment

With internet deployment, anyone can scan the QR code from anywhere in the world! 🌍

### 5. Mobile Access via QR Code

1. In **Dashboard**, click "Show QR Code" button
2. A QR code will appear with the mobile dashboard URL
3. Scan the QR code with any mobile device
4. Mobile live dashboard opens instantly in browser
5. View real-time queue updates on mobile
6. No app installation required!

**Mobile Features:**
- ✅ Auto-refresh every 2 seconds
- ✅ Mobile-optimized interface
- ✅ Language selection
- ✅ Visual queue status indicators
- ✅ Wait time estimates
- ✅ Best queue recommendations

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