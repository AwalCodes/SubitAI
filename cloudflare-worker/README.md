# SubitAI Cloudflare Worker Backend

High-performance serverless backend for SubitAI subtitle generation using Groq Whisper API.

## Features

- **Instant Cold Starts**: 0ms cold start time with Cloudflare Workers
- **Fast Transcription**: Groq Whisper-large-v3 (0.5-1x realtime)
- **Multiple Formats**: SRT, VTT, and JSON output
- **Streaming Support**: Real-time progress updates for large files
- **Auto Language Detection**: Supports 50+ languages
- **Secure**: Token-based authentication via Supabase
- **Scalable**: Handles millions of requests

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.dev.vars` file:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your keys:

```
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Local Development

```bash
npm run dev
```

Worker will run on `http://localhost:8787`

### 4. Deploy to Cloudflare

```bash
# Set secrets
wrangler secret put GROQ_API_KEY
wrangler secret put SUPABASE_SERVICE_KEY

# Deploy
npm run deploy
```

## API Endpoints

### POST /transcribe

Transcribe audio/video file and return subtitles.

**Request:**
```bash
curl -X POST http://localhost:8787/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4" \
  -F "language=en" \
  -F "format=srt,vtt,json"
```

**Response:**
```json
{
  "success": true,
  "text": "Full transcript text...",
  "language": "en",
  "duration": 120.5,
  "segments": [...],
  "srt": "1\n00:00:00,000 --> 00:00:05,000\nHello world\n",
  "vtt": "WEBVTT\n\n1\n00:00:00.000 --> 00:00:05.000\nHello world\n",
  "processing_time_ms": 3500
}
```

### POST /transcribe/stream

Stream transcription progress (for large files).

**Request:**
```bash
curl -X POST http://localhost:8787/transcribe/stream \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large_video.mp4"
```

**Response (NDJSON stream):**
```json
{"status":"processing","progress":10,"message":"Uploading file..."}
{"status":"processing","progress":30,"message":"Extracting audio..."}
{"status":"processing","progress":50,"message":"Transcribing..."}
{"status":"completed","progress":100,"data":{...}}
```

### GET /languages

Get list of supported languages.

### GET /health

Health check endpoint.

## Performance

- **Cold Start**: <10ms
- **Processing Time**: 0.5-1x realtime (5 min audio = 2.5-5 min processing)
- **Max File Size**: 500MB
- **Concurrent Requests**: Unlimited (auto-scaling)

## Supported Formats

### Input
- Audio: MP3, WAV, OGG, FLAC, AAC, M4A
- Video: MP4, MOV, AVI, WEBM, MKV

### Output
- SRT (SubRip)
- VTT (WebVTT)
- JSON (structured data)

## Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Rate Limiting

Recommended: Implement rate limiting in frontend or Cloudflare dashboard.

## Cost Estimation

- Cloudflare Workers: Free tier (100k requests/day)
- Groq API: Check current pricing at groq.com
- Typical cost: ~$0.0001-0.001 per transcription

## Troubleshooting

### "Invalid authorization"
- Check your Supabase token is valid
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY

### "Groq API error"
- Verify GROQ_API_KEY is set correctly
- Check file size (max 500MB)
- Ensure file format is supported

### Slow transcription
- Groq API may be under load
- Check file size (larger = slower)
- Verify network connection

## Development

### Run Tests
```bash
npm test
```

### View Logs
```bash
npm run tail
```

### Deploy to Production
```bash
npm run deploy:production
```

