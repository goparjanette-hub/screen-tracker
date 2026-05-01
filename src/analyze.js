import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a productivity analyst AI. Analyze screenshots and return ONLY a JSON object, no markdown.

Schema:
{
  "app": "primary app or website visible",
  "task": "brief description of specific task (max 80 chars)",
  "productive": true/false,
  "confidence": 0.0-1.0,
  "category": "coding|writing|design|communication|research|learning|admin|entertainment|social_media|idle|other",
  "notes": "optional context (max 100 chars)"
}`;

export async function analyzeScreenshot({ base64, mediaType = 'image/jpeg' }) {
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Analyze this screenshot and return the JSON object.' }
        ]
      }]
    });
    const raw = response.content[0].text.trim();
    // Limpiar markdown fences si vienen
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(clean);
    return {
      app: parsed.app || 'Unknown',
      task: parsed.task || 'Unknown task',
      productive: Boolean(parsed.productive),
      confidence: Number(parsed.confidence) || 0.5,
      category: parsed.category || 'other',
      notes: parsed.notes || '',
      rawAnalysis: clean,
    };
  } catch (err) {
    console.error('❌  Analysis error:', err.message);
    return { app: 'Unknown', task: 'Analysis failed', productive: false, confidence: 0, category: 'other', notes: '', rawAnalysis: null };
  }
}
