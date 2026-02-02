/**
 * SubitAI API Client v2 - Cloudflare Worker Backend
 * Improved error handling, retry logic, and real upload progress
 */

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';

// Types
interface TranscribeOptions {
  file?: File;
  fileUrl?: string;
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
 * Use the access_token we store in localStorage via Providers,
 * which is synced from Clerk's Supabase JWT template.
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem('access_token');
    } catch (error) {
      console.error('Error reading access_token from localStorage:', error);
    }
  }
  return null;
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
    // Add cache-busting parameter to ensure fresh data
    const url = `${WORKER_URL}/quota?_t=${Date.now()}`;
    console.log('Fetching quota from:', url)
    const response = await fetch(url, {
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
  const { file, fileUrl, language = 'en', format = 'srt,vtt,json', onProgress, projectId } = options;

  if (!file && !fileUrl) {
    throw { error: 'No file or fileUrl provided', status: 400 } as APIError;
  }

  const token = await getAuthToken();
  if (!token) {
    throw { error: 'Not authenticated', status: 401 } as APIError;
  }

  return withRetry(async () => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (fileUrl) {
      formData.append('fileUrl', fileUrl);
    }
    formData.append('language', language);
    formData.append('format', format);
    if (projectId) {
      formData.append('projectId', projectId);
    }

    // Create XMLHttpRequest for progress tracking
    return new Promise<TranscriptionResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress to transcription service
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          // Upload to transcription service: 0-25% of total transcription
          const uploadProgress = Math.round((e.loaded / e.total) * 25);
          // If sending URL, upload is tiny, so this might jump quickly. That's fine.
          onProgress(uploadProgress, fileUrl ? 'Sending file URL...' : `Uploading to transcription service... ${uploadProgress}%`);
        }
      });

      // Track download progress (response) - this is the actual transcription processing
      xhr.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          // Processing: 25-100% of total transcription
          // Map download progress to 25-100% range
          const downloadProgress = 25 + Math.round((e.loaded / e.total) * 75);

          // Determine stage based on progress
          let message = '';
          if (downloadProgress < 40) {
            message = `Processing audio... ${downloadProgress}%`;
          } else if (downloadProgress < 70) {
            message = `Generating subtitles... ${downloadProgress}%`;
          } else if (downloadProgress < 90) {
            message = `Finalizing subtitles... ${downloadProgress}%`;
          } else {
            message = `Almost done... ${downloadProgress}%`;
          }

          onProgress(downloadProgress, message);
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
