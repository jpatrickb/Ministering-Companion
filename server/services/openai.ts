import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function transcribeAudio(audioFilePath: string): Promise<{ text: string }> {
  try {
    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
    });

    return {
      text: transcription.text,
    };
  } catch (error) {
    throw new Error("Failed to transcribe audio: " + (error instanceof Error ? error.message : String(error)));
  }
}

export async function analyzeMinisteringEntry(transcript: string): Promise<{
  summary: string;
  followups: string[];
  scriptures: string[];
  talks: string[];
}> {
  try {
    const prompt = `
You are an AI assistant helping with LDS ministering. Analyze this ministering visit transcript and provide:

1. A thoughtful summary of the conversation (2-3 sentences)
2. Suggested follow-up actions (3-5 specific, actionable items)
3. Relevant scripture references that might help this person (2-4 references with brief context)
4. Suggested LDS conference talks or resources (2-3 talks with titles and speakers)

Focus on spiritual needs, emotional support, and practical help. Be compassionate and Christ-centered in your suggestions.

Transcript: "${transcript}"

Respond with JSON in this exact format:
{
  "summary": "string",
  "followups": ["string1", "string2", "string3"],
  "scriptures": ["scripture1 - brief context", "scripture2 - brief context"],
  "talks": ["Talk Title by Speaker - brief relevance", "Talk Title by Speaker - brief relevance"]
}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a compassionate AI assistant helping LDS church members with their ministering responsibilities. Provide thoughtful, scripture-based guidance.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      summary: result.summary || "Visit completed successfully.",
      followups: result.followups || [],
      scriptures: result.scriptures || [],
      talks: result.talks || [],
    };
  } catch (error) {
    throw new Error("Failed to analyze ministering entry: " + (error instanceof Error ? error.message : String(error)));
  }
}

export async function generateInsights(entries: Array<{ transcript: string; date: string }>): Promise<{
  patterns: string[];
  suggestions: string[];
}> {
  try {
    const transcriptsText = entries
      .map(entry => `Date: ${entry.date}\nContent: ${entry.transcript}`)
      .join("\n\n---\n\n");

    const prompt = `
Analyze these ministering visit transcripts to identify patterns and provide insights:

${transcriptsText}

Provide:
1. Patterns you notice in the person's spiritual journey, challenges, or growth (3-4 observations)
2. Suggestions for future ministering approaches or topics to discuss (3-4 actionable suggestions)

Be encouraging and focus on spiritual growth opportunities.

Respond with JSON in this format:
{
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a wise, compassionate AI assistant helping with LDS ministering insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      patterns: result.patterns || [],
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    throw new Error("Failed to generate insights: " + (error instanceof Error ? error.message : String(error)));
  }
}
