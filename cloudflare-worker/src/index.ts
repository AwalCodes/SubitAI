/**
 * SubitAI Cloudflare Worker - Main Entry Point
 * Handles subtitle generation using Groq Whisper API
 */

import { Hono } from 'hono';
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
  extractAudioFromVideo,
} from './utils/media';

// Types
interface Env {
  GROQ_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ALLOWED_ORIGINS: string;
}

function validateEnv(env: Env): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!env.GROQ_API_KEY) missing.push('GROQ_API_KEY');
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_KEY');
  return { ok: missing.length === 0, missing };
}

type SubscriptionTier = 'free' | 'pro' | 'team' | string;

interface QuotaLimits {
  dailyEnergy: number;
  videoLength: number;
  videoSize: number;
}

interface QuotaSummary {
  tier: SubscriptionTier;
  limit: number;
  usedToday: number;
  remaining: number;
}

function getSubscriptionLimits(tier: SubscriptionTier): QuotaLimits {
  switch (tier) {
    case 'pro':
      return {
        dailyEnergy: 300,
        videoLength: 30 * 60, // 30 minutes
        videoSize: 500 * 1024 * 1024, // 500MB
      };
    case 'team':
      return {
        dailyEnergy: Number.POSITIVE_INFINITY,
        videoLength: Number.POSITIVE_INFINITY,
        videoSize: 1024 * 1024 * 1024, // 1GB
      };
    case 'free':
    default:
      return {
        dailyEnergy: 30,
        videoLength: 5 * 60, // 5 minutes
        videoSize: 200 * 1024 * 1024, // 200MB
      };
  }
}

async function getTodayUsageEnergy(userId: string, env: Env): Promise<number> {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const url = new URL(`${env.SUPABASE_URL}/rest/v1/usage_tracking`);
    url.searchParams.set('user_id', `eq.${userId}`);
    url.searchParams.set('created_at', `gte.${startOfDay.toISOString()}`);
    url.searchParams.set('select', 'energy_cost');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      console.error('Failed to fetch usage:', res.status, text);
      // Return 0 instead of throwing to allow quota check to continue
      return 0;
    }

    let rows: Array<{ energy_cost: number | null }>;
    try {
      rows = (await res.json()) as Array<{ energy_cost: number | null }>;
    } catch (error) {
      console.error('Failed to parse usage response:', error);
      return 0;
    }

    return rows.reduce((sum, row) => {
      const cost = row.energy_cost ?? 0;
      // Never allow negative usage to decrease total energy used
      return sum + (cost > 0 ? cost : 0);
    }, 0);
  } catch (error) {
    console.error('Error in getTodayUsageEnergy:', error);
    // Return 0 to allow processing to continue
    return 0;
  }
}

async function getEffectiveSubscriptionTier(userId: string, env: Env): Promise<SubscriptionTier> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('Invalid userId provided to getEffectiveSubscriptionTier');
      return 'free';
    }

    const url = new URL(`${env.SUPABASE_URL}/rest/v1/billing`);
    url.searchParams.set('user_id', `eq.${userId.trim()}`);
    url.searchParams.set('status', 'eq.active');
    url.searchParams.set('order', 'current_period_end.desc');
    url.searchParams.set('limit', '1');
    url.searchParams.set('select', 'plan,status,current_period_end');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      console.error('Failed to fetch billing info:', res.status, text);
      return 'free';
    }

    let rows: Array<{
      plan: SubscriptionTier;
      status: string;
      current_period_end: string | null;
    }>;

    try {
      rows = (await res.json()) as Array<{
        plan: SubscriptionTier;
        status: string;
        current_period_end: string | null;
      }>;
    } catch (error) {
      console.error('Failed to parse billing response:', error);
      return 'free';
    }

    if (!rows || !rows.length) {
      return 'free';
    }

    const record = rows[0];

    if (!record || record.status !== 'active') {
      return 'free';
    }

    if (record.current_period_end) {
      const periodEnd = new Date(record.current_period_end);
      if (isNaN(periodEnd.getTime()) || periodEnd < new Date()) {
        return 'free';
      }
    }

    return record.plan || 'free';
  } catch (error) {
    console.error('Error determining subscription tier:', error);
    return 'free';
  }
}

async function recordUsage(
  userId: string,
  actionType: string,
  energyCost: number,
  env: Env,
  projectId?: string | null,
): Promise<void> {
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/usage_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([
        {
          user_id: userId,
          project_id: projectId ?? null,
          action_type: actionType,
          energy_cost: energyCost,
        },
      ]),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      console.error('Failed to record usage:', res.status, text);
      throw new Error(`Failed to record usage: ${res.status}`);
    }
  } catch (error) {
    console.error('Error recording usage:', error);
    throw error;
  }
}

async function getQuotaSummary(
  userId: string,
  env: Env,
): Promise<QuotaSummary> {
  const tier = await getEffectiveSubscriptionTier(userId, env);
  const limits = getSubscriptionLimits(tier || 'free');
  const { dailyEnergy } = limits;

  if (!Number.isFinite(dailyEnergy)) {
    return {
      tier: tier || 'free',
      limit: Number.POSITIVE_INFINITY,
      usedToday: 0,
      remaining: Number.POSITIVE_INFINITY,
    };
  }

  const usedToday = await getTodayUsageEnergy(userId, env);
  const remaining = Math.max(0, dailyEnergy - usedToday);

  return {
    tier: tier || 'free',
    limit: dailyEnergy,
    usedToday,
    remaining,
  };
}

function calculateEnergyCostFromFileSize(_fileSize: number): number {
  // Fixed cost per transcription request
  return 10;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) {
    return 'unlimited';
  }
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
  return `${value} ${sizes[i]}`;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());

// CORS middleware - must be before other routes
app.use('*', async (c, next) => {
  // Allow multiple origins configured via ALLOWED_ORIGINS env (comma-separated)
  const allowedOrigins = c.env.ALLOWED_ORIGINS
    ? c.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const origin = c.req.header('Origin') || '';
  const allowAll = allowedOrigins.length === 0;
  const isAllowedOrigin = allowAll || allowedOrigins.includes(origin);

  // Handle preflight OPTIONS request
  if (c.req.method === 'OPTIONS') {
    if (isAllowedOrigin) {
      return c.json(null, 204, {
        'Access-Control-Allow-Origin': allowAll ? '*' : origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': allowAll ? 'false' : 'true',
        'Access-Control-Max-Age': '86400',
      });
    } else {
      return c.json({ error: 'CORS not allowed' }, 403);
    }
  }

  // Apply CORS headers to all responses
  if (isAllowedOrigin) {
    c.header('Access-Control-Allow-Origin', allowAll ? '*' : origin);
    c.header('Access-Control-Allow-Credentials', allowAll ? 'false' : 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  await next();
});

// Error handling middleware
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  }, 500);
});

// Health check endpoint
app.get('/health', (c) => {
  const envStatus = validateEnv(c.env);

  if (!envStatus.ok) {
    console.error('Worker environment misconfigured: missing bindings', envStatus.missing);
    return c.json({
      status: 'unhealthy',
      service: 'subit-ai-worker',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      envOk: false,
    }, 500);
  }

  return c.json({
    status: 'healthy',
    service: 'subit-ai-worker',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    envOk: true,
  });
});

// Quota endpoint - returns daily energy limits and current usage for authenticated user
app.get('/quota', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ success: false, error: 'Missing authorization' }, 401);
    }

    const user = await getUser(authHeader, c.env);
    if (!user) {
      return c.json({ success: false, error: 'Invalid authorization' }, 401);
    }

    const tier = await getEffectiveSubscriptionTier(user.id, c.env);
    const effectiveTier = tier || 'free';
    const limits = getSubscriptionLimits(effectiveTier);

    const summary = await getQuotaSummary(user.id, c.env);

    return c.json({
      success: true,
      dailyLimit: Number.isFinite(summary.limit) ? summary.limit : null,
      usedToday: summary.usedToday || 0,
      remaining: Number.isFinite(summary.remaining) ? summary.remaining : null,
      subscriptionTier: effectiveTier,
      unlimited: !Number.isFinite(summary.limit),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Quota endpoint error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch quota',
      timestamp: new Date().toISOString(),
    }, 500);
  }
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

    const tier = await getEffectiveSubscriptionTier(user.id, c.env);
    const limits = getSubscriptionLimits(tier || 'free');

    // Parse multipart form data
    const formData = await c.req.formData();
    const fileEntry = formData.get('file');
    const languageEntry = formData.get('language');
    const formatEntry = formData.get('format');
    const projectIdEntry = formData.get('projectId');

    const file = fileEntry && typeof fileEntry === 'object' && 'arrayBuffer' in (fileEntry as any)
      ? (fileEntry as File)
      : null;
    const language = typeof languageEntry === 'string' && languageEntry
      ? languageEntry
      : 'en';
    const format = typeof formatEntry === 'string' && formatEntry
      ? formatEntry
      : 'srt,vtt,json';
    const projectId = typeof projectIdEntry === 'string' && projectIdEntry
      ? projectIdEntry
      : undefined;

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    if (Number.isFinite(limits.videoSize) && file.size > limits.videoSize) {
      return c.json({
        success: false,
        error: 'File size exceeds limit for your plan',
        code: 'file_too_large',
        maxSizeBytes: limits.videoSize,
        maxSizeHumanReadable: formatBytes(limits.videoSize),
        tier: tier || 'free',
        timestamp: new Date().toISOString(),
      }, 400);
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return c.json({ 
        success: false, 
        error: validation.error 
      }, 400);
    }

    // Enforce daily quota before doing any heavy processing
    const energyCost = calculateEnergyCostFromFileSize(file.size);

    try {
      const summary = await getQuotaSummary(user.id, c.env);

      if (Number.isFinite(summary.limit) && energyCost > summary.remaining) {
        return c.json({
          success: false,
          error: 'Daily quota exceeded',
          code: 'quota_exceeded',
          dailyLimit: summary.limit,
          usedToday: summary.usedToday,
          remaining: summary.remaining,
          timestamp: new Date().toISOString(),
        }, 402);
      }
    } catch (quotaError) {
      console.error('Quota check failed:', quotaError);
      return c.json({
        success: false,
        error: 'Failed to verify quota',
        timestamp: new Date().toISOString(),
      }, 500);
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

    if (Number.isFinite(limits.videoLength) && transcription.duration > limits.videoLength) {
      return c.json({
        success: false,
        error: 'Video duration exceeds limit for your plan',
        code: 'video_too_long',
        maxDurationSeconds: limits.videoLength,
        actualDurationSeconds: transcription.duration,
        tier: tier || 'free',
        timestamp: new Date().toISOString(),
      }, 400);
    }

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

    // Record usage; if this fails, do not return the transcription
    try {
      await recordUsage(user.id, 'transcribe', energyCost, c.env, projectId);
    } catch (usageError) {
      console.error('Failed to record usage after transcription:', usageError);
      return c.json({
        success: false,
        error: 'Failed to record usage',
        code: 'usage_tracking_failed',
        timestamp: new Date().toISOString(),
      }, 500);
    }

    return c.json(response);

  } catch (error: any) {
    const requestId = (globalThis as any).crypto?.randomUUID
      ? (globalThis as any).crypto.randomUUID()
      : `req_${Date.now().toString(36)}`;

    console.error('Transcription error:', { requestId, error });

    return c.json({
      success: false,
      error: 'Failed to transcribe audio',
      requestId,
      timestamp: new Date().toISOString(),
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
        const fileEntry = formData.get('file');
        const file = fileEntry && typeof fileEntry === 'object' && 'arrayBuffer' in (fileEntry as any)
          ? (fileEntry as File)
          : null;

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

