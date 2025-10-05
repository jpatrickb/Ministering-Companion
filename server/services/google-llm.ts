import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || '';
if (!apiKey) {
  console.warn('GOOGLE_GENAI_API_KEY is not set. Google Generative AI calls will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash' });

function safeParseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON block
    const match = text.match(/\{[\s\S]*\}$/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    return {};
  }
}

export async function analyzeMinisteringEntry(transcript: string): Promise<{
  summary: string;
  followups: string[];
  scriptures: string[];
  talks: string[];
}> {
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

  try {
    const res = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });
    const text = res.response.text();
    const result = safeParseJson(text);

    return {
      summary: result.summary || 'Visit completed successfully.',
      followups: Array.isArray(result.followups) ? result.followups : [],
      scriptures: Array.isArray(result.scriptures) ? result.scriptures : [],
      talks: Array.isArray(result.talks) ? result.talks : [],
    };
  } catch (error) {
    throw new Error('Failed to analyze ministering entry: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export async function generateInsights(entries: Array<{ transcript: string; date: string }>): Promise<{
  patterns: string[];
  suggestions: string[];
}> {
  const transcriptsText = entries
    .map((entry) => `Date: ${entry.date}\nContent: ${entry.transcript}`)
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

  try {
    const res = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });
    const text = res.response.text();
    const result = safeParseJson(text);

    return {
      patterns: Array.isArray(result.patterns) ? result.patterns : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    };
  } catch (error) {
    throw new Error('Failed to generate insights: ' + (error instanceof Error ? error.message : String(error)));
  }
}