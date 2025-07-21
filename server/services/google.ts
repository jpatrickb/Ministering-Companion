import { SpeechClient } from '@google-cloud/speech';
import * as fs from 'fs';
import * as path from 'path';

const client = new SpeechClient();

// Map file extensions to Google Cloud Speech encoding types
function getAudioEncoding(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.wav':
      return 'LINEAR16';
    case '.flac':
      return 'FLAC';
    case '.mp3':
      return 'MP3';
    case '.ogg':
    case '.oga':
      return 'OGG_OPUS';
    case '.webm':
      return 'WEBM_OPUS';
    case '.m4a':
    case '.mp4':
      return 'MP3'; // Fallback to MP3 for M4A/MP4
    default:
      return 'WEBM_OPUS'; // Default fallback
  }
}

export async function transcribeAudioGoogle(filePath: string): Promise<{ text: string }> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    const audio = {
      content: fs.readFileSync(filePath).toString('base64'),
    };

    const encoding = getAudioEncoding(filePath);
    
    const config = {
      encoding: encoding as any,
      sampleRateHertz: 44100,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      model: 'latest_short', // Best for short audio clips
    };

    const request = {
      audio: audio,
      config: config,
    };

    console.log(`Transcribing audio with Google Speech-to-Text (encoding: ${encoding})`);
    const [response] = await client.recognize(request);
    
    if (!response.results || response.results.length === 0) {
      console.warn('Google Speech-to-Text returned no transcription results');
      return { text: '' };
    }

    const transcription = response.results
      .map(result => result.alternatives?.[0]?.transcript)
      .filter(text => text) // Filter out undefined/empty results
      .join(' ') || '';

    return { text: transcription };
  } catch (error) {
    console.error('Google transcription error:', error);
    throw new Error('Failed to transcribe audio with Google Speech-to-Text: ' + (error instanceof Error ? error.message : String(error)));
  }
}
