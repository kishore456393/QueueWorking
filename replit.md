# QueueGuidance - AI-Powered Queue Management System

## Overview
QueueGuidance is a comprehensive full-stack JavaScript application for managing queues using AI-powered person detection. The system allows users to upload videos, define queue zones through polygon drawing, and monitor real-time queue analytics with intelligent recommendations.

## Purpose
Transform queue management with cutting-edge AI technology, providing real-time insights and recommendations to optimize customer flow and reduce wait times.

## Tech Stack
- **Frontend**: React + TypeScript + Wouter (routing) + TanStack Query
- **Backend**: Express + Node.js + WebSocket (real-time updates)
- **Styling**: Tailwind CSS + Shadcn UI components
- **Detection**: Simulated AI detection (mock data generator)
- **Storage**: In-memory storage with full CRUD operations

## Project Architecture

### Data Model
- **Videos**: Uploaded video files with metadata
- **Queue Zones**: Polygon definitions for each queue area
- **Detection Snapshots**: Real-time detection results and analytics
- **Settings**: User preferences (language, audio, refresh rate)

### Frontend Pages
1. **Home** (`/`) - Feature overview and quick start guide
2. **Setup** (`/setup`) - Video upload and polygon zone drawing
3. **Dashboard** (`/dashboard`) - Live queue metrics with auto-refresh
4. **Analytics** (`/analytics`) - Historical data and trends

### Backend API
- `/api/videos` - Video upload and management
- `/api/queue-zones` - Polygon zone CRUD operations
- `/api/detection-snapshots` - Detection data management
- `/api/settings` - User preferences
- `/ws` - WebSocket for real-time updates

## Features

### Core Features
- ✅ Video upload with drag-and-drop support
- ✅ Interactive polygon drawing on canvas
- ✅ Real-time queue detection and counting
- ✅ Live dashboard with auto-refresh
- ✅ WebSocket-based real-time updates
- ✅ Queue analytics and recommendations
- ✅ Multi-language support (14+ languages)
- ✅ Audio announcements using Web Speech API
- ✅ Responsive professional dark theme
- ✅ Historical data tracking and charts

### Detection System
Currently using a mock detection generator that simulates YOLO-based person detection. The system:
- Generates realistic queue counts
- Simulates person movement between queues
- Provides real-time updates via WebSocket
- Identifies best/worst queues
- Generates intelligent recommendations

### Real-time Updates
The system uses WebSocket connections to push detection updates from backend to frontend, ensuring the dashboard always shows the latest queue statistics without manual refresh.

## Recent Changes
- 2025-11-04: Initial project setup
- 2025-11-04: Data model and storage implementation
- 2025-11-04: Backend API routes with WebSocket support
- 2025-11-04: Frontend pages creation (in progress)

## User Preferences
- Default language: English
- Support for 14+ languages including Hindi, Tamil, Telugu, Bengali, etc.
- Audio announcements: Optional, with configurable intervals
- Dashboard auto-refresh: Configurable (1-30 seconds)
- Professional dark theme with gradient accents

## Development Notes
- Uses in-memory storage for rapid prototyping
- Mock detection data for UI development
- Ready for Python YOLO integration as separate microservice
- WebSocket architecture for scalable real-time updates
- Follows modern React patterns with TypeScript

## Future Enhancements
- Integration with Python YOLO detection microservice
- Persistent database storage (PostgreSQL)
- User authentication and multi-tenancy
- Advanced analytics with trend prediction
- Mobile app support
- Export reports and statistics
