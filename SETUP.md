# SUBIT.AI Setup Guide

This guide will walk you through setting up SUBIT.AI from scratch, including all the necessary services and configurations.

## 📋 Prerequisites

Before you begin, make sure you have:

- [Node.js 18+](https://nodejs.org/) and npm/yarn
- [Python 3.11+](https://python.org/)
- [Docker and Docker Compose](https://docker.com/)
- [Git](https://git-scm.com/)

## 🔧 Service Setup

### 1. Supabase Setup

1. **Create Supabase Account:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get API Keys:**
   - Go to Settings → API
   - Copy the following:
     - Project URL
     - `anon` public key
     - `service_role` secret key

3. **Database Setup:**
   - Go to SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Paste and execute the script

4. **Storage Setup:**
   - Go to Storage
   - The buckets should be created automatically by the schema
   - Verify these buckets exist:
     - `videos`
     - `subtitles`
     - `exports`

### 2. OpenAI Setup

1. **Create OpenAI Account:**
   - Go to [openai.com](https://openai.com)
   - Sign up and add payment method
   - Generate an API key

2. **Get API Key:**
   - Go to API Keys section
   - Create a new secret key
   - Copy the key (starts with `sk-`)

### 3. Stripe Setup

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for an account
   - Complete account verification

2. **Get API Keys:**
   - Go to Developers → API Keys
   - Copy:
     - Publishable key (starts with `pk_test_`)
     - Secret key (starts with `sk_test_`)

3. **Create Products and Prices:**
   - Go to Products
   - Create products for Free, Pro, and Premium plans
   - Create recurring prices for Pro ($10/month) and Premium ($50/month)
   - Note the price IDs (starts with `price_`)

4. **Set up Webhooks:**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-backend-url.com/api/billing/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret

### 4. Redis Setup (Optional for Local Development)

For local development, you can use Docker:
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

For production, use a managed service like:
- [Railway Redis](https://railway.app)
- [Upstash](https://upstash.com)
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/)

## 🚀 Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd subit-ai

# Copy environment variables
cp env.example .env

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment Variables

Edit the `.env` file with your actual values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Application URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Servers

**Option A: Using Docker (Recommended)**
```bash
# Start all services
docker-compose up

# Or start specific services
docker-compose up redis backend celery-worker frontend
```

**Option B: Manual Setup**
```bash
# Terminal 1: Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Terminal 2: Start Backend
cd backend
source venv/bin/activate
celery -A workers.celery worker --loglevel=info &
uvicorn main:app --reload --port 8000

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### 4. Verify Setup

1. **Frontend:** Visit `http://localhost:3000`
2. **Backend:** Visit `http://localhost:8000/docs` (FastAPI docs)
3. **Health Check:** Visit `http://localhost:8000/api/health`

## 🧪 Testing the Application

### 1. Create an Account
- Go to `http://localhost:3000/auth/signup`
- Create a new account
- Verify email (check Supabase Auth logs)

### 2. Upload a Video
- Go to Dashboard
- Click "New Project"
- Upload a test video (MP4, under 200MB)
- Wait for processing

### 3. Test Subtitle Generation
- Once processing is complete
- View the generated subtitles
- Edit and customize them
- Export the video

## 🚀 Production Deployment

### Frontend (Vercel)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel login
vercel
```

3. **Set Environment Variables in Vercel Dashboard:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL` (your backend URL)

### Backend (Railway)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Deploy:**
```bash
cd backend
railway login
railway init
railway up
```

3. **Set Environment Variables:**
```bash
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
railway variables set OPENAI_API_KEY=your_openai_key
railway variables set STRIPE_SECRET_KEY=your_stripe_secret
railway variables set STRIPE_WEBHOOK_SECRET=your_webhook_secret
railway variables set REDIS_URL=your_redis_url
```

## 🔍 Troubleshooting

### Common Issues

1. **Supabase Connection Error:**
   - Verify your Supabase URL and keys
   - Check if your project is active
   - Ensure RLS policies are set up correctly

2. **OpenAI API Error:**
   - Verify your API key is correct
   - Check if you have sufficient credits
   - Ensure the key has the right permissions

3. **Stripe Webhook Error:**
   - Verify webhook URL is accessible
   - Check webhook signing secret
   - Ensure all required events are selected

4. **Redis Connection Error:**
   - Verify Redis is running
   - Check connection URL
   - Ensure Redis is accessible from your application

5. **Video Upload Issues:**
   - Check file size limits
   - Verify supported formats
   - Ensure Supabase storage is configured

### Debug Mode

Enable debug logging by setting:
```env
ENVIRONMENT=development
```

### Logs

- **Frontend:** Check browser console
- **Backend:** Check terminal output or Railway logs
- **Celery:** Check worker terminal output
- **Supabase:** Check Auth and Database logs in dashboard

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all services are running and accessible
5. Check the GitHub issues for similar problems

For additional help, contact support@subit.ai or create an issue in the repository.








