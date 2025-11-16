# SubitAI - Complete Deployment Guide

## Overview
This guide covers deploying the refactored SubitAI platform:
- **Frontend**: Next.js on Vercel
- **Backend**: Cloudflare Workers (serverless)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Prerequisites

- Node.js 18+ installed
- Vercel account
- Cloudflare account
- Supabase account
- Groq API key

## Part 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set database password (save it!)
5. Wait for project to initialize

### 1.2 Run Database Migrations

1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `/supabase/schema.sql`
3. Paste and execute
4. Verify tables created: `users`, `projects`, `subtitles`, `billing`

### 1.3 Configure Storage

1. Go to Storage → Buckets
2. Verify buckets exist: `videos`, `subtitles`, `exports`
3. If not, create them:
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('videos', 'videos', false);
   ```

4. Configure CORS for storage:
   - Go to Storage → Configuration
   - Add allowed origins: `http://localhost:3000`, `https://yourdomain.com`

### 1.4 Get API Keys

1. Go to Project Settings → API
2. Copy:
   - Project URL: `SUPABASE_URL`
   - anon/public key: `SUPABASE_ANON_KEY`
   - service_role key: `SUPABASE_SERVICE_KEY` (keep secret!)

## Part 2: Cloudflare Worker Deployment

### 2.1 Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2.2 Configure Worker

```bash
cd cloudflare-worker
npm install
```

### 2.3 Set Environment Secrets

```bash
# Set secrets (never commit these!)
wrangler secret put GROQ_API_KEY
# Enter your Groq API key when prompted

wrangler secret put SUPABASE_URL
# Enter your Supabase URL

wrangler secret put SUPABASE_SERVICE_KEY
# Enter your Supabase service role key

wrangler secret put ALLOWED_ORIGINS
# Enter: http://localhost:3000,https://yourdomain.com
```

### 2.4 Deploy Worker

```bash
# Deploy to production
npm run deploy

# You'll get a URL like: https://subit-ai-worker.your-subdomain.workers.dev
# Save this URL - you'll need it for frontend config
```

### 2.5 Verify Deployment

```bash
# Test health endpoint
curl https://subit-ai-worker.your-subdomain.workers.dev/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "subit-ai-worker",
#   "version": "2.0.0"
# }
```

## Part 3: Frontend Deployment (Vercel)

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 3.2 Configure Environment Variables

Create `.env.local` for local development:

```bash
cd frontend

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev
EOF
```

### 3.3 Build and Test Locally

```bash
npm install
npm run build
npm run dev

# Open http://localhost:3000
# Test upload flow end-to-end
```

### 3.4 Deploy to Vercel

#### Option A: Deploy via CLI

```bash
# First deployment
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: subit-ai
# - Directory: ./frontend
# - Override settings? No

# Production deployment
vercel --prod
```

#### Option B: Deploy via Git (Recommended)

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WORKER_URL`

6. Click "Deploy"

### 3.5 Update CORS Settings

After deployment, update Cloudflare Worker CORS:

```bash
# Update the secret with your Vercel URL
wrangler secret put ALLOWED_ORIGINS
# Enter: https://yourdomain.vercel.app,https://yourdomain.com
```

## Part 4: Custom Domain Setup

### 4.1 Frontend Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `yourdomain.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-10 minutes)

### 4.2 Worker Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Workers & Pages → Your Worker
2. Click "Triggers" → "Add Custom Domain"
3. Enter: `api.yourdomain.com`
4. DNS records auto-configured
5. Update frontend env: `NEXT_PUBLIC_WORKER_URL=https://api.yourdomain.com`

## Part 5: Post-Deployment Configuration

### 5.1 Update Supabase Redirect URLs

1. Go to Supabase → Authentication → URL Configuration
2. Add Site URL: `https://yourdomain.com`
3. Add Redirect URLs:
   - `https://yourdomain.com/**`
   - `http://localhost:3000/**` (for development)

### 5.2 Configure Supabase Email Templates

1. Go to Authentication → Email Templates
2. Customize:
   - Confirm signup
   - Reset password
   - Magic link

### 5.3 Set Up Monitoring

#### Cloudflare Analytics
1. Go to Workers & Pages → Your Worker → Metrics
2. Monitor: Requests, Errors, CPU time

#### Vercel Analytics
1. Go to Project → Analytics
2. Monitor: Page views, Performance, Errors

### 5.4 Enable Rate Limiting (Recommended)

1. Go to Cloudflare Dashboard → Security → WAF
2. Create rate limiting rule:
   - Path: `/transcribe*`
   - Limit: 10 requests per minute per IP
   - Action: Block

## Part 6: Verify Full Deployment

### 6.1 Test Checklist

- [ ] Homepage loads: `https://yourdomain.com`
- [ ] Sign up works
- [ ] Sign in works
- [ ] Upload page accessible
- [ ] File upload works
- [ ] Transcription completes
- [ ] Subtitles display correctly
- [ ] Download SRT works
- [ ] Download VTT works
- [ ] Mobile responsive

### 6.2 Performance Check

```bash
# Test worker response time
curl -w "@curl-format.txt" -o /dev/null -s https://api.yourdomain.com/health

# Expected: < 100ms
```

### 6.3 Security Check

- [ ] HTTPS enabled on all endpoints
- [ ] Environment variables not exposed
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] RLS policies active in Supabase

## Troubleshooting

### "Worker not found"
- Verify worker is deployed: `wrangler deployments list`
- Check worker URL is correct
- Wait 1-2 minutes for global distribution

### "CORS error"
- Verify `ALLOWED_ORIGINS` includes your frontend domain
- Check CORS middleware in worker
- Clear browser cache

### "Authentication failed"
- Verify Supabase keys are correct
- Check redirect URLs in Supabase settings
- Verify cookies are enabled

### "Transcription fails"
- Check Groq API key is valid
- Verify file size < 500MB
- Check worker logs: `wrangler tail`

### "Database connection error"
- Verify Supabase service key
- Check RLS policies
- Verify database is not paused

## Maintenance

### Update Worker

```bash
cd cloudflare-worker
git pull
npm install
npm run deploy
```

### Update Frontend

```bash
cd frontend
git pull
npm install

# Vercel auto-deploys on git push
git push origin main
```

### Database Migrations

```bash
# Create migration
cd supabase/migrations
touch 002_new_feature.sql

# Apply migration
# Copy to Supabase SQL Editor and execute
```

## Cost Estimation

### Cloudflare Workers
- Free tier: 100,000 requests/day
- Paid: $5/10 million requests
- Typical cost: $0-10/month

### Vercel
- Free tier: 100GB bandwidth
- Paid: $20/month (Pro)
- Typical cost: $0-20/month

### Supabase
- Free tier: 500MB database, 1GB storage
- Paid: $25/month (Pro)
- Typical cost: $0-25/month

### Groq API
- Check current pricing at groq.com
- Typical: $0.0001-0.001 per transcription
- 1000 transcriptions ≈ $0.10-1.00

**Total estimated cost: $0-60/month**

## Scaling Recommendations

### For 1,000+ users:
- Upgrade Supabase to Pro ($25/mo)
- Enable Cloudflare caching
- Use CDN for video delivery
- Implement Redis for caching

### For 10,000+ users:
- Upgrade Vercel to Pro ($20/mo)
- Use dedicated database
- Implement job queue
- Add load balancing

## Support

For issues:
1. Check logs: `wrangler tail` and Vercel logs
2. Review error messages
3. Check documentation
4. Contact support

## Rollback Procedure

### Rollback Worker

```bash
# List deployments
wrangler deployments list

# Rollback to previous
wrangler rollback [deployment-id]
```

### Rollback Frontend

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

