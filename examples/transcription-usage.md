# Transcription Provider Usage Examples

This document shows how to use and switch between transcription providers in the Ministering Companion application.

## Quick Start

### Using OpenAI Whisper (Default)

1. Set your environment variables:
```bash
export TRANSCRIPTION_PROVIDER=openai
export OPENAI_API_KEY=your-openai-api-key
```

2. The application will automatically use OpenAI Whisper for transcription.

### Using Google Speech-to-Text (Free Alternative)

1. Follow the [Google Speech-to-Text Setup Guide](../docs/google-transcription-setup.md)

2. Set your environment variables:
```bash
export TRANSCRIPTION_PROVIDER=google
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

3. The application will automatically use Google Speech-to-Text for transcription.

## Switching Providers

You can switch between providers by simply changing the environment variable:

```bash
# Switch to Google (free tier)
export TRANSCRIPTION_PROVIDER=google

# Switch back to OpenAI
export TRANSCRIPTION_PROVIDER=openai
```

No code changes or application restarts are required beyond setting the environment variable.

## Provider Comparison

| Feature | OpenAI Whisper | Google Speech-to-Text |
|---------|----------------|----------------------|
| **Cost** | Paid ($0.006/minute) | Free (60 min/month) |
| **Accuracy** | Very High | Very High |
| **Speed** | Fast | Very Fast |
| **Language Support** | 99+ languages | 125+ languages |
| **Punctuation** | Yes | Yes |
| **Setup Complexity** | Simple | Moderate |

## Cost Considerations

### Google Speech-to-Text Free Tier
- 60 minutes of audio per month at no cost
- Perfect for moderate usage
- After free tier: $0.006 per 15 seconds

### OpenAI Whisper
- $0.006 per minute from the start
- No free tier, but consistent pricing
- Generally very affordable for most use cases

## Testing Your Setup

You can verify which provider is being used by checking the server logs when processing audio. The system will log:

```
Using google for audio transcription
# or
Using openai for audio transcription
```

## Troubleshooting

### Common Issues

1. **"Invalid transcription provider"**
   - Check that `TRANSCRIPTION_PROVIDER` is set to either `openai` or `google`

2. **"Environment variable required"**
   - Ensure you have the correct API keys/credentials for your chosen provider

3. **"Failed to transcribe audio"**
   - Check your network connection
   - Verify your API keys are valid
   - Ensure your audio file format is supported

### Getting Help

- For OpenAI issues: Check [OpenAI documentation](https://platform.openai.com/docs)
- For Google issues: Check [Google Cloud Speech-to-Text documentation](https://cloud.google.com/speech-to-text/docs)
- For application issues: Check the server logs for detailed error messages
