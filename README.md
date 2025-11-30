# 🎯 QueueGuidance - AI Queue Detection & Management System

A smart queue management system that uses AI to detect people in queues, estimate wait times, and provide real-time analytics.

![Dashboard Preview](https://raw.githubusercontent.com/kishore456393/QueueWorking/main/preview.png)

## ✨ Features

- **Real-time Detection**: Uses YOLOv8 to detect people in video feeds or live cameras.
- **Queue Analytics**: Tracks queue length, wait times, and identifies the fastest/slowest queues.
- **Live Dashboard**: Interactive dashboard with real-time charts and visual overlays.
- **Audio Announcements**: Multi-language voice announcements for queue guidance.
- **Mobile Access**: Scan a QR code to view the live dashboard on your phone.
- **Privacy Focused**: User-scoped feeds and automatic data cleanup.
- **Secure**: Session-based authentication and secure password storage.

## 🚀 Quick Start (Windows)

1.  **Prerequisites**:
    - [Node.js](https://nodejs.org/) (v18+)
    - [Python](https://www.python.org/) (v3.10+)
    - [MySQL Server](https://dev.mysql.com/downloads/mysql/)

2.  **Setup**:
    - Clone the repository.
    - Create a database named `artistry_edu` in MySQL.
    - Copy `.env.example` to `.env` and update `DATABASE_URL` with your MySQL password.
    - Run `start-all.bat`.

3.  **That's it!** The script will:
    - Install all dependencies (Node & Python).
    - Setup the database tables.
    - Start the Backend, Frontend, and AI Detector.
    - Open the dashboard in your browser.

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Detailed guide on installation, database setup, and deploying to other computers.
- **[PRIVACY.md](PRIVACY.md)**: Information about data handling and privacy features.

## 🛠️ Manual Installation

If you prefer to run things manually or are on Linux/Mac:

1.  **Install Node Dependencies**:
    ```bash
    npm install
    ```

2.  **Install Python Dependencies**:
    ```bash
    pip install -r detector/requirements.txt
    ```

3.  **Database Setup**:
    ```bash
    npm run db:push
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Run Python Detector**:
    ```bash
    cd detector
    python main.py
    ```

## 📱 Mobile Access

1.  Open the Dashboard on your computer.
2.  Click the **"Show QR Code"** button.
3.  Scan the code with your phone (must be on the same Wi-Fi).
4.  View live queue stats on your mobile device!

## 🔧 Configuration

You can configure the system via the **Dashboard** or `.env` file:

- **Refresh Interval**: How often to update data (default: 2s).
- **Audio Interval**: How often to make announcements (default: 30s).
- **Language**: Choose from 10+ supported languages.
- **Data Retention**: Old snapshots are deleted automatically after 1 minute to save space.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Ultralytics YOLOv8** for the AI model.
- **Shadcn/ui** for the beautiful components.
- **Drizzle ORM** for database management.