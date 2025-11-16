/**
 * Media file validation and processing utilities
 */

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/aac',
  'audio/m4a',
];

const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska',
];

/**
 * Validate uploaded file
 */
export function validateFile(file: File): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  // Check file type
  const isAudio = SUPPORTED_AUDIO_TYPES.includes(file.type);
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);

  if (!isAudio && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported types: audio (MP3, WAV, OGG, FLAC) and video (MP4, WEBM, MOV, AVI, MKV)`,
    };
  }

  return { valid: true };
}

/**
 * Extract audio from video file
 * Note: In a real implementation, this would use FFmpeg or similar
 * For Cloudflare Workers, we'll pass the video directly to Groq
 * as it supports video inputs
 */
export async function extractAudioFromVideo(
  videoData: Uint8Array
): Promise<Uint8Array> {
  // Groq's Whisper API can handle video files directly
  // So we just return the data as-is
  // If needed, you can implement actual audio extraction using:
  // - FFmpeg WASM
  // - External service call
  // - R2 + external worker
  
  return videoData;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is audio
 */
export function isAudioFile(file: File): boolean {
  return SUPPORTED_AUDIO_TYPES.includes(file.type);
}

/**
 * Check if file is video
 */
export function isVideoFile(file: File): boolean {
  return SUPPORTED_VIDEO_TYPES.includes(file.type);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Estimate transcription time based on file size
 */
export function estimateTranscriptionTime(fileSize: number): number {
  // Groq is very fast, roughly 0.5x-1x realtime
  // Estimate: 1MB ≈ 1 minute of audio ≈ 30-60 seconds processing
  const estimatedMinutes = fileSize / (1024 * 1024);
  return Math.ceil(estimatedMinutes * 45); // 45 seconds per minute of audio
}

