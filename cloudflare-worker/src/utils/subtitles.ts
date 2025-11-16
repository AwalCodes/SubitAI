/**
 * Subtitle format generation utilities
 */

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

/**
 * Format timestamp for SRT format (HH:MM:SS,mmm)
 */
export function formatTimestamp(seconds: number, format: 'srt' | 'vtt' = 'srt'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  const separator = format === 'srt' ? ',' : '.';

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}${separator}${String(millis).padStart(3, '0')}`;
}

/**
 * Generate SRT (SubRip) format
 */
export function generateSRT(segments: Segment[]): string {
  const lines: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    // Skip empty segments
    if (!segment.text || segment.text.trim() === '') {
      continue;
    }

    // Sequence number
    lines.push(String(i + 1));
    
    // Timestamps
    const start = formatTimestamp(segment.start, 'srt');
    const end = formatTimestamp(segment.end, 'srt');
    lines.push(`${start} --> ${end}`);
    
    // Text content
    lines.push(segment.text.trim());
    
    // Empty line between segments
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate VTT (WebVTT) format
 */
export function generateVTT(segments: Segment[]): string {
  const lines: string[] = ['WEBVTT', ''];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    // Skip empty segments
    if (!segment.text || segment.text.trim() === '') {
      continue;
    }

    // Optional cue identifier
    lines.push(String(i + 1));
    
    // Timestamps
    const start = formatTimestamp(segment.start, 'vtt');
    const end = formatTimestamp(segment.end, 'vtt');
    lines.push(`${start} --> ${end}`);
    
    // Text content
    lines.push(segment.text.trim());
    
    // Empty line between segments
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Parse SRT content back to segments
 */
export function parseSRT(srtContent: string): Segment[] {
  const segments: Segment[] = [];
  const blocks = srtContent.trim().split('\n\n');

  for (const block of blocks) {
    const lines = block.split('\n');
    
    if (lines.length < 3) continue;

    // Parse sequence number
    const id = parseInt(lines[0], 10);
    
    // Parse timestamps
    const timestampMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    
    if (!timestampMatch) continue;

    const start = 
      parseInt(timestampMatch[1]) * 3600 +
      parseInt(timestampMatch[2]) * 60 +
      parseInt(timestampMatch[3]) +
      parseInt(timestampMatch[4]) / 1000;

    const end = 
      parseInt(timestampMatch[5]) * 3600 +
      parseInt(timestampMatch[6]) * 60 +
      parseInt(timestampMatch[7]) +
      parseInt(timestampMatch[8]) / 1000;

    // Get text (join remaining lines)
    const text = lines.slice(2).join('\n');

    segments.push({ id, start, end, text });
  }

  return segments;
}

/**
 * Parse VTT content back to segments
 */
export function parseVTT(vttContent: string): Segment[] {
  const segments: Segment[] = [];
  
  // Remove WEBVTT header
  const content = vttContent.replace(/^WEBVTT\s*\n\n/, '');
  const blocks = content.trim().split('\n\n');

  for (const block of blocks) {
    const lines = block.split('\n');
    
    if (lines.length < 2) continue;

    // First line might be identifier or timestamp
    let timestampLine = lines[0];
    let textStartIndex = 1;
    
    if (lines[0].includes('-->')) {
      timestampLine = lines[0];
      textStartIndex = 1;
    } else if (lines.length >= 2 && lines[1].includes('-->')) {
      timestampLine = lines[1];
      textStartIndex = 2;
    } else {
      continue;
    }

    // Parse timestamps (VTT uses . instead of ,)
    const timestampMatch = timestampLine.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
    
    if (!timestampMatch) continue;

    const start = 
      parseInt(timestampMatch[1]) * 3600 +
      parseInt(timestampMatch[2]) * 60 +
      parseInt(timestampMatch[3]) +
      parseInt(timestampMatch[4]) / 1000;

    const end = 
      parseInt(timestampMatch[5]) * 3600 +
      parseInt(timestampMatch[6]) * 60 +
      parseInt(timestampMatch[7]) +
      parseInt(timestampMatch[8]) / 1000;

    // Get text
    const text = lines.slice(textStartIndex).join('\n');

    segments.push({ 
      id: segments.length, 
      start, 
      end, 
      text 
    });
  }

  return segments;
}

/**
 * Merge overlapping segments
 */
export function mergeSegments(segments: Segment[]): Segment[] {
  if (segments.length === 0) return [];

  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const merged: Segment[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // If current overlaps with last, merge them
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
      last.text += ' ' + current.text;
    } else {
      merged.push(current);
    }
  }

  return merged;
}

