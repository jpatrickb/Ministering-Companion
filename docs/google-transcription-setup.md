# Google Speech-to-Text Setup Guide

This guide will help you set up Google's Speech-to-Text service as a free alternative to OpenAI's Whisper for audio transcription.

## Why Google Speech-to-Text?

- **Free tier**: 60 minutes of audio transcription per month at no cost
- **High accuracy**: Google's speech recognition is industry-leading
- **Multiple audio formats**: Supports various audio codecs
- **Fast processing**: Generally faster than OpenAI Whisper

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID - you'll need it later

### 2. Enable the Speech-to-Text API

1. In the Google Cloud Console, go to the [API Library](https://console.cloud.google.com/apis/library)
2. Search for "Speech-to-Text API"
3. Click on it and press "Enable"

### 3. Create a Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Give it a name like "ministering-companion-transcription"
4. For roles, add "Cloud Speech Client" 
5. Click "Done"

### 4. Create and Download a Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the key file and save it securely

### 5. Configure Environment Variables

You have two options for authentication:

#### Option A: Service Account Key File (Recommended)

1. Place your downloaded JSON key file in a secure location
2. Set the environment variable:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
   TRANSCRIPTION_PROVIDER=google
   ```

#### Option B: Project ID (For Google Cloud environments)

1. Set these environment variables:
   ```bash
   GOOGLE_CLOUD_PROJECT=your-project-id
   TRANSCRIPTION_PROVIDER=google
   ```

### 6. Update Your Application

The application will automatically use Google Speech-to-Text when you set `TRANSCRIPTION_PROVIDER=google`.

## Switching Between Providers

To switch transcription providers, simply update the environment variable:

- For OpenAI Whisper: `TRANSCRIPTION_PROVIDER=openai`
- For Google Speech-to-Text: `TRANSCRIPTION_PROVIDER=google`

## Free Tier Limits

Google Speech-to-Text provides:
- 60 minutes of audio processing per month for free
- After that, pricing starts at $0.006 per 15 seconds of audio

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check that your service account key file path is correct
   - Ensure the service account has the "Cloud Speech Client" role

2. **"API not enabled"**
   - Make sure you enabled the Speech-to-Text API in your project

3. **"Project not found"**
   - Verify your project ID is correct
   - Make sure you're using the right Google Cloud project

4. **"Audio format not supported"**
   - The system automatically detects audio formats
   - Supported formats: WEBM, WAV, FLAC, MP3, OGG

### Testing Your Setup

You can test your Google Cloud setup by running:

```bash
# First, make sure you have the correct environment variables set
echo $TRANSCRIPTION_PROVIDER
echo $GOOGLE_APPLICATION_CREDENTIALS

# Then test authentication (if you have gcloud CLI installed)
gcloud auth application-default print-access-token
```

## Cost Monitoring

To monitor your usage and costs:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "Billing" > "Budgets & alerts"
3. Set up budget alerts to notify you before you exceed the free tier

## Support

If you encounter issues:

1. Check the [Google Cloud Speech-to-Text documentation](https://cloud.google.com/speech-to-text/docs)
2. Review your Google Cloud Console logs
3. Ensure your service account permissions are correct
