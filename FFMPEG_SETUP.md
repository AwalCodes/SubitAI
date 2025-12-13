# FFmpeg Video Export - Setup Guide

This project uses a **dedicated microservice** for high-performance server-side FFmpeg video export.

## Architecture

1. **Frontend**: Next.js App (`/frontend`)
   - User clicks "Export"
   - Browser calls `/api/export-video` (Next.js API Route)
   - Next.js proxies the request to the Video Export Service
2. **Backend**: Video Export Service (`/video-export-service`)
   - Receives video + subtitles
   - Uses FFmpeg (server-side) to burn subtitles fast
   - Streams the MP4 back

## 🚀 Deployment Instructions

### 1. Deploy the Video Export Service (Backend)
You need to deploy the `/video-export-service` folder as a standalone service.

**Option A: Railway (Recommended)**
1. Connect your GitHub repo to Railway.
2. Set the **Root Directory** to `/video-export-service`.
3. Railway will detect `railway.json` and deploy it.
4. Copy the assigned domain (e.g., `https://video-service-production.up.railway.app`).

**Option B: Render / Others**
- Deploy as a **Web Service**.
- **Root Directory**: `/video-export-service`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- Ensure `ffmpeg` is installed (Render's native Node environment might need a Docker deploy or specific build setup). *Docker is provided in the folder for this reason.*

### 2. Configure the Frontend
In your Next.js deployment (e.g., Vercel):
1. Add an **Environment Variable**:
   ```
   VIDEO_EXPORT_SERVICE_URL=https://your-video-service-url.app
   ```
   *(Do NOT use the trailing slash /export, just the base URL)*

2. Redeploy the frontend.

## 🔧 Local Development

1. **Start Backend**:
   ```bash
   cd video-export-service
   npm install
   npm start
   ```
   (Runs on http://localhost:3001)

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   (Runs on http://localhost:3000)

The frontend is already configured to look for `http://localhost:3001` if the env var is missing.

