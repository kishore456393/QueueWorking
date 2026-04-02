# 🎯 QueueGuidance - AI Queue Detection & Management System

A smart queue management system that uses AI (YOLOv8) to detect people in queues, estimate wait times, and provide real-time analytics.

## ✨ Features

- **Real-time Queue Detection** - YOLOv8-powered AI detects people in video feeds or live cameras
- **Queue Analytics** - Track queue lengths, wait times, identify fastest/slowest queues
- **Live Dashboard** - Interactive charts, real-time updates, and visual overlays
- **Audio Announcements** - Multi-language voice guidance for queue management
- **Mobile Access** - QR code sharing for viewing on mobile devices
- **Dark/Light Mode** - Beautiful UI with theme support
- **Secure Authentication** - Supabase Auth with Google OAuth support

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express, Drizzle ORM
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **AI Detection**: Python, YOLOv8 (Ultralytics)
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) v3.10+
- [Supabase](https://supabase.com/) account

### 1. Clone & Install

```bash
git clone https://github.com/kishore456393/QueueWorking.git
cd QueueWorking
npm install
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

PORT=5000
NODE_ENV=development
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Enable **Google OAuth** in Authentication → Providers
3. Add redirect URL: `https://your-domain.com` (or `http://localhost:5000` for dev)
4. Create required tables in SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  queue_name TEXT,
  count INTEGER,
  wait_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Run AI Detector (Optional)

```bash
cd detector
python main.py
```

## 🌐 Deploy to Vercel

### Frontend Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Backend (Serverless Functions)

For full-stack deployment on Vercel, the Express backend runs as serverless functions. The build output is configured to work with Vercel's serverless architecture.

## 📁 Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities
│   │   └── pages/       # Page components
├── server/              # Express backend
├── shared/              # Shared types/schemas
├── detector/            # Python YOLOv8 detector
└── dist/                # Build output
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |

## 📱 Mobile Access

1. Open the Dashboard
2. Navigate to TV Mode or Dashboard
3. Click **"Show QR Code"**
4. Scan with your phone (same network)

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://ultralytics.com/) - AI detection model
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Deployment platform
