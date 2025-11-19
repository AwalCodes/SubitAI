/**
 * SubitAI Cloudflare Worker - Main Entry Point
 * Handles subtitle generation using Groq Whisper API
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { transcribeAudio } from './services/groq';
import { validateAuth, getUser } from './services/auth';
import { 
  generateSRT, 
  generateVTT, 
  formatTimestamp 
} from './utils/subtitles';
import { 
  validateFile, 
  extractAudioFromVideo 
} from './utils/media';

// Types
interface Env {
  GROQ_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ALLOWED_ORIGINS: string;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', async (c, next) => {
  // Allow multiple origins configured via ALLOWED_ORIGINS env (comma-separated)
  const allowedOrigins = c.env.ALLOWED_ORIGINS
    ? c.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const corsMiddleware = cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  });

  return corsMiddleware(c, next);
});

// Error handling middleware
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  }, 500);
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'subit-ai-worker',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Main transcription endpoint
app.post('/transcribe', async (c) => {
  try {
    // Validate authentication
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ success: false, error: 'Missing authorization' }, 401);
    }

    const user = await getUser(authHeader, c.env);
    if (!user) {
      return c.json({ success: false, error: 'Invalid authorization' }, 401);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const language = (formData.get('language') as string) || 'en';
    const format = (formData.get('format') as string) || 'srt,vtt,json';

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return c.json({ 
        success: false, 
        error: validation.error 
      }, 400);
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Convert file to buffer for processing
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    // Extract audio if video file
    const audioData = file.type.startsWith('video/') 
      ? await extractAudioFromVideo(uint8Array)
      : uint8Array;

    // Transcribe using Groq Whisper
    const startTime = Date.now();
    const transcription = await transcribeAudio(
      audioData,
      c.env.GROQ_API_KEY,
      language
    );
    const processingTime = Date.now() - startTime;

    console.log(`Transcription completed in ${processingTime}ms`);

    // Generate requested formats
    const formats = format.split(',').map(f => f.trim().toLowerCase());
    const response: any = {
      success: true,
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      segments: transcription.segments,
      processing_time_ms: processingTime,
    };

    if (formats.includes('srt')) {
      response.srt = generateSRT(transcription.segments);
    }

    if (formats.includes('vtt')) {
      response.vtt = generateVTT(transcription.segments);
    }

    if (formats.includes('json')) {
      response.json = transcription;
    }

    return c.json(response);

  } catch (error: any) {
    console.error('Transcription error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to transcribe audio',
      details: error.stack,
    }, 500);
  }
});

// Streaming transcription endpoint (for large files)
app.post('/transcribe/stream', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ success: false, error: 'Missing authorization' }, 401);
    }

    const user = await getUser(authHeader, c.env);
    if (!user) {
      return c.json({ success: false, error: 'Invalid authorization' }, 401);
    }

    // Create a TransformStream for streaming response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process in background
    (async () => {
      try {
        const formData = await c.req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
          await writer.write(encoder.encode(JSON.stringify({ 
            error: 'No file provided' 
          })));
          await writer.close();
          return;
        }

        // Send progress updates
        await writer.write(encoder.encode(JSON.stringify({ 
          status: 'processing',
          progress: 10,
          message: 'Uploading file...'
        }) + '\n'));

        const fileBuffer = await file.arrayBuffer();
        
        await writer.write(encoder.encode(JSON.stringify({ 
          status: 'processing',
          progress: 30,
          message: 'Extracting audio...'
        }) + '\n'));

        const uint8Array = new Uint8Array(fileBuffer);
        const audioData = file.type.startsWith('video/') 
          ? await extractAudioFromVideo(uint8Array)
          : uint8Array;

        await writer.write(encoder.encode(JSON.stringify({ 
          status: 'processing',
          progress: 50,
          message: 'Transcribing...'
        }) + '\n'));

        const transcription = await transcribeAudio(
          audioData,
          c.env.GROQ_API_KEY
        );

        await writer.write(encoder.encode(JSON.stringify({ 
          status: 'processing',
          progress: 90,
          message: 'Generating formats...'
        }) + '\n'));

        // Send final result
        await writer.write(encoder.encode(JSON.stringify({ 
          status: 'completed',
          progress: 100,
          data: {
            text: transcription.text,
            srt: generateSRT(transcription.segments),
            vtt: generateVTT(transcription.segments),
            segments: transcription.segments,
          }
        }) + '\n'));

        await writer.close();

      } catch (error: any) {
        await writer.write(encoder.encode(JSON.stringify({ 
          status: 'error',
          error: error.message 
        }) + '\n'));
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Get supported languages
app.get('/languages', (c) => {
  return c.json({
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'auto', name: 'Auto-detect' },
    ],
  });
});

// Export for Cloudflare Workers
export default app;

