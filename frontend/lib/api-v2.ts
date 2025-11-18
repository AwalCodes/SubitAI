/**
 * SubitAI API Client v2 - Cloudflare Worker Backend
 * Improved error handling, retry logic, and real upload progress
 */

import { createClient } from '@supabase/supabase-js';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface TranscribeOptions {
  file: File;
  language?: string;
  format?: string;
  onProgress?: (progress: number, message?: string) => void;
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
}

/**
 * Get current auth token
 */
async function getAuthToken(): Promise<string | null> {
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
 * Transcribe audio/video file
 */
export async function transcribeFile(options: TranscribeOptions): Promise<TranscriptionResult> {
  const { file, language = 'en', format = 'srt,vtt,json', onProgress } = options;

  const token = await getAuthToken();
  if (!token) {
    throw { error: 'Not authenticated', status: 401 } as APIError;
  }

  return withRetry(async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('format', format);

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
                status: xhr.status 
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
              details: errorData.details
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

/**
 * Transcribe with streaming progress (for large files)
 */
export async function transcribeFileStream(options: TranscribeOptions): Promise<TranscriptionResult> {
  const { file, language = 'en', onProgress } = options;

  const token = await getAuthToken();
  if (!token) {
    throw { error: 'Not authenticated', status: 401 } as APIError;
  }

  const formData = new FormData();
  formData.append('file', file);
  if (language !== 'auto') {
    formData.append('language', language);
  }

  const response = await fetch(`${WORKER_URL}/transcribe/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw { 
      error: error.error || 'Transcription failed', 
      status: response.status 
    } as APIError;
  }

  // Read NDJSON stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult: TranscriptionResult | null = null;

  if (!reader) {
    throw { error: 'No response body', status: 500 } as APIError;
  }

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // Process complete lines
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const data = JSON.parse(line);
        
        if (data.status === 'processing') {
          onProgress?.(data.progress, data.message);
        } else if (data.status === 'completed') {
          onProgress?.(100, 'Complete');
          finalResult = {
            success: true,
            ...data.data,
          };
        } else if (data.status === 'error') {
          throw { error: data.error, status: 500 } as APIError;
        }
      } catch (e) {
        console.error('Failed to parse stream line:', line, e);
      }
    }

    // Keep incomplete line in buffer
    buffer = lines[lines.length - 1];
  }

  if (!finalResult) {
    throw { error: 'No result received', status: 500 } as APIError;
  }

  return finalResult;
}

/**
 * Get supported languages
 */
export async function getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
  const response = await fetch(`${WORKER_URL}/languages`);
  
  if (!response.ok) {
    throw { error: 'Failed to fetch languages', status: response.status } as APIError;
  }

  const data = await response.json();
  return data.languages;
}

/**
 * Save transcription to database
 */
export async function saveTranscription(
  projectId: string,
  transcription: TranscriptionResult
): Promise<void> {
  const { data, error } = await supabase
    .from('subtitles')
    .upsert({
      project_id: projectId,
      srt_data: transcription.srt,
      json_data: {
        text: transcription.text,
        language: transcription.language,
        segments: transcription.segments,
        duration: transcription.duration,
      },
      language: transcription.language,
    });

  if (error) {
    throw { error: error.message, status: 500 } as APIError;
  }
}

/**
 * Upload video to Supabase Storage
 */
export async function uploadVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ path: string; url: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw { error: 'Not authenticated', status: 401 } as APIError;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // Upload with progress tracking
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw { error: error.message, status: 500 } as APIError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrl,
  };
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${WORKER_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

const apiV2 = {
  transcribeFile,
  transcribeFileStream,
  getSupportedLanguages,
  saveTranscription,
  uploadVideo,
  healthCheck,
};

export default apiV2;
