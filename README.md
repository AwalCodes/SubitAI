# SUBIT.AI - AI Subtitle Generator SaaS Platform

A production-grade AI-powered subtitle generation platform that lets users upload videos, automatically generate subtitles using OpenAI Whisper, edit them, and export watermark-free videos.

## 🚀 Features

- **AI-Powered Transcription**: Uses OpenAI Whisper for accurate speech-to-text
- **Interactive Subtitle Editor**: Timeline-based editing with real-time preview
- **Video Export**: Burn subtitles directly into videos or download as SRT files
- **Freemium Model**: Free tier with premium Pro and Team plans
- **Modern UI**: Clean, responsive design built with Next.js and Tailwind CSS
- **Secure Authentication**: Supabase Auth with email and OAuth support
- **Scalable Architecture**: FastAPI backend with Supabase database

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python) + Celery + Redis
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Engine**: OpenAI Whisper (Whisper-large-v3)
- **Video Processing**: FFmpeg + MoviePy
- **Authentication**: Supabase Auth
- **Payments**: Stripe Subscriptions
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📁 Project Structure

```
subit-ai/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages and layouts
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and configurations
│   ├── hooks/               # Custom React hooks
│   └── styles/              # Global styles
├── backend/                 # FastAPI backend application
│   ├── main.py             # FastAPI app entry point
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── models/             # Database models
│   └── workers/            # Celery background tasks
├── supabase/               # Supabase configuration
│   ├── schema.sql          # Database schema
│   ├── storage/            # Storage policies
│   └── functions/          # Edge functions
├── docker-compose.yml      # Local development setup
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- Docker and Docker Compose
- Supabase account
- OpenAI API key
- Stripe account

### 1. Clone and Setup

```bash
git clone <repository-url>
cd subit-ai

# Copy environment variables
cp env.example .env

# Install dependencies
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..
```

### 2. Environment Variables

Edit the `.env` file with your actual values:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Application URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the schema setup:
```bash
# Connect to your Supabase database and run:
psql -h your_db_host -U postgres -d postgres -f supabase/schema.sql
```

### 4. Local Development with Docker

```bash
# Start all services
docker-compose up

# Or start individual services
docker-compose up redis backend celery-worker frontend
```

### 5. Local Development without Docker

```bash
# Start Redis (if not using Docker)
docker run -d -p 6379:6379 redis:7-alpine

# Start backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
celery -A workers.celery worker --loglevel=info &
uvicorn main:app --reload --port 8000

# Start frontend (in new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📊 Pricing Plans

| Plan | Price | Video Length | Features |
|------|-------|--------------|----------|
| Free | $0 | 5 minutes | Basic subtitles, watermark |
| Pro | $10/month | 30 minutes | Advanced features, no watermark |
| Team | $25/month | Unlimited | Priority processing, team features |

## 🔧 API Endpoints

- `POST /api/upload` - Upload video file
- `POST /api/generate-subtitles` - Generate subtitles with Whisper
- `PUT /api/edit-subtitles` - Update subtitle content
- `POST /api/export` - Export video with burned-in subtitles
- `GET /api/projects` - List user projects
- `POST /api/translate` - Translate subtitles (premium)

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect to Vercel:**
```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

2. **Set Environment Variables in Vercel Dashboard:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL` (your backend URL)

3. **Deploy:**
```bash
vercel --prod
```

### Backend (Railway)

1. **Connect to Railway:**
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
```

2. **Set Environment Variables:**
```bash
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
railway variables set OPENAI_API_KEY=your_openai_key
railway variables set STRIPE_SECRET_KEY=your_stripe_secret
railway variables set STRIPE_WEBHOOK_SECRET=your_webhook_secret
railway variables set REDIS_URL=your_redis_url
```

3. **Deploy:**
```bash
railway up
```

### Database (Supabase)

1. **Deploy Schema:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the script

2. **Configure Storage:**
   - Go to Storage → Policies
   - Ensure the policies from the schema are active

3. **Set up Edge Functions (Optional):**
   - Deploy any edge functions for additional functionality

### Redis (Railway or Upstash)

For production, use a managed Redis service:

**Railway Redis:**
```bash
railway add redis
```

**Upstash Redis:**
1. Create account at upstash.com
2. Create a Redis database
3. Use the connection string in your environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@subit.ai or join our Discord community.
# SubitAI
