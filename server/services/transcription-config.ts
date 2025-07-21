export type TranscriptionProvider = 'openai' | 'google';

export interface TranscriptionConfig {
  provider: TranscriptionProvider;
}

// Central configuration - change this value to switch providers
export const TRANSCRIPTION_CONFIG: TranscriptionConfig = {
  provider: process.env.TRANSCRIPTION_PROVIDER as TranscriptionProvider || 'google'
};

// Environment variable validation
export function validateTranscriptionConfig(): void {
  const provider = TRANSCRIPTION_CONFIG.provider;
  
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required when using OpenAI transcription');
    }
  } else if (provider === 'google') {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
      throw new Error(
        'Google Cloud credentials are required when using Google transcription. ' +
        'Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_PROJECT environment variables.'
      );
    }
  } else {
    throw new Error(`Invalid transcription provider: ${provider}. Must be 'openai' or 'google'`);
  }
}
