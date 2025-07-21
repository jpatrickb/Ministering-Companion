import { TRANSCRIPTION_CONFIG, validateTranscriptionConfig } from './transcription-config.js';
import { transcribeAudio as transcribeWithOpenAI } from './openai.js';
import { transcribeAudioGoogle } from './google.js';

// Validate configuration on module load
validateTranscriptionConfig();

export async function transcribeAudio(audioFilePath: string): Promise<{ text: string }> {
  try {
    const provider = TRANSCRIPTION_CONFIG.provider;
    console.log(`Using ${provider} for audio transcription`);

    switch (provider) {
      case 'openai':
        return await transcribeWithOpenAI(audioFilePath);
      
      case 'google':
        return await transcribeAudioGoogle(audioFilePath);
      
      default:
        throw new Error(`Unsupported transcription provider: ${provider}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to transcribe audio with ${TRANSCRIPTION_CONFIG.provider}: ${errorMessage}`);
  }
}
