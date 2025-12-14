/**
 * Groq API Integration for Whisper Transcription
 */

interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  segments: TranscriptionSegment[];
}

/**
 * Transcribe audio using Groq Whisper API
 */
export async function transcribeAudio(
  audioData: Uint8Array,
  apiKey: string,
  language: string = 'en'
): Promise<TranscriptionResult> {
  try {
    // Create form data with audio file
    const formData = new FormData();
    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-large-v3');
    
    // Add language if specified (not 'auto')
    if (language && language !== 'auto') {
      formData.append('language', language);
    }
    
    // Enable timestamp words for better segmentation
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    console.log('Sending request to Groq API...');

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const result: any = await response.json();
    console.log('Groq API response received');

    // Process the response into our format
    const segments: TranscriptionSegment[] = [];
    
    const rawSegments: Array<{ start?: number; end?: number; text?: string }> =
      Array.isArray(result?.segments) ? (result.segments as Array<any>) : [];

    if (rawSegments.length > 0) {
      for (let i = 0; i < rawSegments.length; i++) {
        const seg = rawSegments[i] || {};
        segments.push({
          id: i,
          start: Number(seg.start) || 0,
          end: Number(seg.end) || 0,
          text: String(seg.text || '').trim(),
        });
      }
    } else {
      // If no segments, create one from full text
      segments.push({
        id: 0,
        start: 0,
        end: Number(result?.duration) || 0,
        text: String(result?.text || ''),
      });
    }

    return {
      text: String(result?.text || ''),
      language: String(result?.language || language),
      duration: Number(result?.duration) || 0,
      segments,
    };

  } catch (error: any) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Retry logic wrapper for Groq API calls
 */
export async function transcribeWithRetry(
  audioData: Uint8Array,
  apiKey: string,
  language: string = 'en',
  maxRetries: number = 3
): Promise<TranscriptionResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Transcription attempt ${attempt}/${maxRetries}`);
      return await transcribeAudio(audioData, apiKey, language);
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Transcription failed after retries');
}
