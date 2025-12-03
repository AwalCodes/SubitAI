# Free Video Export Service

A free, self-hosted video export service using FFmpeg for burning subtitles into videos.

## Features

- ✅ Free to run (use free hosting services)
- ✅ Fast server-side processing with FFmpeg
- ✅ High-quality MP4 export
- ✅ Subtitle styling support
- ✅ Easy deployment

## Quick Deploy (Free Options)

### Option 1: Railway (Recommended - Easiest)

1. Fork this repo
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway will automatically detect and deploy
6. Get your service URL and add to frontend

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Deploy and get URL

### Option 3: Fly.io

```bash
fly launch
fly deploy
```

## Environment Variables

None required! This service is completely free and self-contained.

## API Usage

### POST /export

```javascript
const formData = new FormData()
formData.append('videoUrl', 'https://example.com/video.mp4')
formData.append('subtitles', JSON.stringify(subtitles))
formData.append('style', JSON.stringify(style))

const response = await fetch('YOUR_SERVICE_URL/export', {
  method: 'POST',
  body: formData
})

const blob = await response.blob()
// Download or use the MP4 video
```

## Local Development

```bash
npm install
npm start
```

Service runs on `http://localhost:3001`

## Requirements

- Node.js 18+
- FFmpeg installed on server
  - Ubuntu/Debian: `apt-get install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Railway/Render: Auto-installed

## Update Frontend

After deploying, update your frontend to use this service:

```typescript
const response = await fetch('YOUR_SERVICE_URL/export', {
  method: 'POST',
  body: formData
})
```
