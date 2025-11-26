/**
 * SubitAI API Client v2 - Cloudflare Worker Backend
 * Improved error handling, retry logic, and real upload progress
 */

import { createClient as getBrowserSupabaseClient } from '@/lib/supabase';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_WORKER_URL) {
  if (typeof window === 'undefined') {
    throw new Error('NEXT_PUBLIC_WORKER_URL must be set in production');
  } else {
    console.error('NEXT_PUBLIC_WORKER_URL is not set in production');
  }
}

// Reuse the single browser Supabase client to avoid multiple GoTrueClient instances
const supabase = getBrowserSupabaseClient();

// Types
interface TranscribeOptions {
  file: File;
  language?: string;
  format?: string;
  onProgress?: (progress: number, message?: string) => void;
  projectId?: string;
}

interface TranscriptionResult {
  success: boolean;
  text: string;
  language: string;
  duration: number;
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  srt?: string;
  vtt?: string;
  processing_time_ms: number;
}

interface APIError {
  error: string;
  details?: string;
  status?: number;
  code?: string;
}

export interface QuotaInfo {
  success: boolean;
  dailyLimit: number | null;
  usedToday: number;
  remaining: number | null;
  subscriptionTier: string;
  unlimited: boolean;
  timestamp: string;
}

/**
 * Get current auth token
 *
 * Prefer the cached access_token we store in localStorage via Providers,
 * and fall back to Supabase auth session if needed.
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    try {
      const storedToken = window.localStorage.getItem('access_token');
      if (storedToken) {
        return storedToken;
      }
    } catch (error) {
      // Ignore localStorage errors and fall back to Supabase
      console.error('Error reading access_token from localStorage:', error);
    }
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Fetch current quota / usage information for the authenticated user
 */
export async function fetchQuota(): Promise<QuotaInfo> {
  const token = await getAuthToken();
  if (!token) {
    throw { error: 'Not authenticated', status: 401 } as APIError;
  }

  return withRetry(async () => {
    const response = await fetch(`${WORKER_URL}/quota`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let data: any;
    try {
      data = await response.json();
    } catch (error) {
      throw {
        error: 'Invalid quota response from server',
        status: response.status,
      } as APIError;
    }

    if (!response.ok || !data?.success) {
      throw {
        error: data?.error || 'Failed to fetch quota',
        status: response.status,
      } as APIError;
    }

    return data as QuotaInfo;
  });
}

/**
 * Transcribe audio/video file
 */
export async function transcribeFile(options: TranscribeOptions): Promise<TranscriptionResult> {
  const { file, language = 'en', format = 'srt,vtt,json', onProgress, projectId } = options;

  const token = await getAuthToken();
  if (!token) {
    throw { error: 'Not authenticated', status: 401 } as APIError;
  }

  return withRetry(async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('format', format);
    if (projectId) {
      formData.append('projectId', projectId);
    }

    // Create XMLHttpRequest for progress tracking
    return new Promise<TranscriptionResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const uploadProgress = Math.round((e.loaded / e.total) * 50); // Upload is 50% of total
          onProgress(uploadProgress, 'Uploading...');
        }
      });

      // Track download progress (response)
      xhr.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const downloadProgress = 50 + Math.round((e.loaded / e.total) * 50); // Processing is other 50%
          onProgress(downloadProgress, 'Processing...');
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              onProgress?.(100, 'Complete');
              resolve(result);
            } else {
              reject({ 
                error: result.error || 'Transcription failed', 
                status: xhr.status,
                code: result.code,
                details: result.details,
              });
            }
          } catch (e) {
            reject({ 
              error: 'Invalid response from server', 
              status: xhr.status 
            });
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject({ 
              error: errorData.error || 'Request failed', 
              status: xhr.status,
              details: errorData.details,
              code: errorData.code,
            });
          } catch (e) {
            reject({ 
              error: `Request failed with status ${xhr.status}`, 
              status: xhr.status 
            });
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject({ 
          error: 'Network error occurred', 
          status: 0 
        });
      });

      xhr.addEventListener('timeout', () => {
        reject({ 
          error: 'Request timed out', 
          status: 0 
        });
      });

      xhr.open('POST', `${WORKER_URL}/transcribe`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.timeout = 300000; // 5 minutes timeout
      xhr.send(formData);
    });
  });
}
