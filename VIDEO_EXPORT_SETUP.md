# Video Export Setup Guide

## Current Status

The video export feature currently exports as WebM format in the browser, which is slow and limited. To achieve fast, high-quality MP4 exports like professional SaaS platforms, you need server-side video processing.

## Recommended Solutions (Ranked by Ease & Performance)

### Option 1: Mux.com Video API (⭐ RECOMMENDED - Easiest)

**Why:** Professional video platform used by companies like Vercel, GitHub, etc. Handles all video processing, encoding, and delivery.

**Setup:**
```bash
npm install @mux/mux-node
```

**Implementation:**
1. Create Mux account at https://www.mux.com
2. Get API keys from dashboard
3. Upload video to Mux
4. Use Mux to burn subtitles and export MP4
5. Return processed video URL

**Pros:**
- ✅ Fast, reliable, scalable
- ✅ Handles all encoding complexities
- ✅ CDN delivery included
- ✅ Professional grade

**Cons:**
- ❌ Paid service (but very reasonable pricing)

**Docs:** https://docs.mux.com

---

### Option 2: Cloudflare Stream API

**Why:** If you're already using Cloudflare Workers, this integrates seamlessly.

**Setup:**
1. Enable Cloudflare Stream in dashboard
2. Use Stream API to upload and process videos
3. Burn subtitles using Stream's API

**Pros:**
- ✅ Integrates with existing Cloudflare setup
- ✅ Fast edge processing
- ✅ Good pricing

**Cons:**
- ❌ Requires Cloudflare account upgrade

**Docs:** https://developers.cloudflare.com/stream/

---

### Option 3: Separate Backend Service with FFmpeg

**Why:** Full control, no external dependencies, free.

**Setup:**
1. Create a separate Node.js/Python service
2. Install FFmpeg on the server
3. Process videos server-side

**Example Node.js service:**
```javascript
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

async function burnSubtitles(videoPath, srtPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .videoFilters(`subtitles=${srtPath}`)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

**Pros:**
- ✅ Full control
- ✅ No external service costs
- ✅ Flexible customization

**Cons:**
- ❌ Requires server management
- ❌ More complex setup
- ❌ Resource intensive

---

### Option 4: IMG.LY Server-Side Video SDK

**Why:** Professional video rendering SDK, handles licensing, GPU acceleration.

**Pros:**
- ✅ Professional solution
- ✅ GPU accelerated
- ✅ Handles codec licensing

**Cons:**
- ❌ Paid service
- ❌ More complex integration

**Docs:** https://img.ly/docs/cesdk/server/rendering/introduction/

---

## Quick Implementation: Mux.com (Recommended)

Here's how to set it up quickly:

### 1. Install Mux SDK

```bash
cd frontend
npm install @mux/mux-node
```

### 2. Create API Route

Create `frontend/app/api/export-video-mux/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Mux from '@mux/mux-node'

const mux = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, subtitles, style } = await request.json()
    
    // 1. Download video from URL
    const videoResponse = await fetch(videoUrl)
    const videoBlob = await videoResponse.blob()
    
    // 2. Upload to Mux
    const asset = await mux.video.assets.create({
      input: videoBlob,
      playback_policy: 'public',
    })
    
    // 3. Generate SRT from subtitles
    const srtContent = generateSRT(subtitles)
    
    // 4. Create Mux track with subtitles
    await mux.video.assets.createTrack({
      assetId: asset.id,
      language_code: 'en',
      closed_captions: true,
      text_type: 'subtitles',
      url: srtContent, // Upload SRT to storage first
    })
    
    // 5. Return playback URL
    return NextResponse.json({
      success: true,
      playbackUrl: asset.playback_ids[0].id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### 3. Add Environment Variables

```env
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret
```

### 4. Update Frontend Export Handler

Modify `SubtitleEditor.tsx` to call the Mux endpoint instead of client-side export.

---

## Migration Path

1. **Immediate:** Keep client-side WebM export as fallback
2. **Short-term:** Implement Mux.com integration (recommended)
3. **Long-term:** Consider Cloudflare Stream if staying with Cloudflare ecosystem

---

## Testing

After implementing server-side export:
1. Export a short video (1-2 minutes) to test
2. Check export speed and quality
3. Verify MP4 format
4. Test with different video sizes

---

## Need Help?

- Mux Support: https://mux.com/support
- Cloudflare Support: https://support.cloudflare.com
- FFmpeg Docs: https://ffmpeg.org/documentation.html

