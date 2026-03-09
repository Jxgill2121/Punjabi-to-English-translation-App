import express, { Request, Response } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new Anthropic();

// Grade-level story configurations
const GRADE_CONFIGS: Record<number, { description: string; maxWords: number }> = {
  1: {
    description:
      'Grade 1 (age 6–7): Use only very simple, common 3–5 letter words like cat, dog, sun, run, big, red. Very short sentences of 3–5 words. Topic: animals or family.',
    maxWords: 60,
  },
  2: {
    description:
      'Grade 2 (age 7–8): Simple common words, short clear sentences of 6–8 words. Topic: school, friends, or simple nature.',
    maxWords: 80,
  },
  3: {
    description:
      'Grade 3 (age 8–9): Common words with some new vocabulary. Complete sentences with adjectives. Topic: seasons, adventures, or animals.',
    maxWords: 100,
  },
  4: {
    description:
      'Grade 4 (age 9–10): Mix of familiar and new vocabulary. Descriptive sentences. Topic: nature, simple science, or community.',
    maxWords: 120,
  },
  5: {
    description:
      'Grade 5 (age 10–11): Good vocabulary variety including interesting words. Compound sentences. Topic: discovery, friendship, or nature.',
    maxWords: 140,
  },
  6: {
    description:
      'Grade 6 (age 11–12): Rich vocabulary, more complex sentences. Engaging themes like journeys, challenges, or discoveries.',
    maxWords: 160,
  },
  7: {
    description:
      'Grade 7 (age 12–13): Advanced vocabulary, sophisticated narrative. Themes like courage, identity, or wonder.',
    maxWords: 180,
  },
};

// POST /api/story — streams a story via Server-Sent Events
app.post('/api/story', async (req: Request, res: Response) => {
  const { grade } = req.body as { grade: number };

  if (!grade || grade < 1 || grade > 7) {
    res.status(400).json({ error: 'Grade must be between 1 and 7' });
    return;
  }

  const config = GRADE_CONFIGS[grade];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `Write a short, engaging English story for someone learning English.

Requirements:
- Level: ${config.description}
- Maximum ${config.maxWords} words total
- Write a complete story with a clear beginning, middle, and end
- Make it warm, interesting, and enjoyable to read
- Use plain prose only — no bullet points, headers, or formatting
- Do NOT include any introduction, title, or explanation — write ONLY the story text itself

Write the story now:`,
        },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Story generation error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate story. Please check your API key.' })}\n\n`);
    res.end();
  }
});

// POST /api/define — returns a Punjabi definition for a word
app.post('/api/define', async (req: Request, res: Response) => {
  const { word, sentence } = req.body as { word: string; sentence?: string };

  if (!word) {
    res.status(400).json({ error: 'Word is required' });
    return;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `I am a Punjabi speaker learning English. Please help me understand the English word "${word}"${sentence ? ` as used in this sentence: "${sentence}"` : ''}.

Respond in exactly this format with no extra text:

PUNJABI: [Simple definition in Punjabi using Gurmukhi script — 1 or 2 clear sentences that a Punjabi speaker would easily understand]
EXAMPLE: [One simple, clear English sentence using the word "${word}"]`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const punjabiMatch = text.match(/PUNJABI:\s*(.+?)(?=\nEXAMPLE:|$)/s);
    const exampleMatch = text.match(/EXAMPLE:\s*(.+?)$/s);

    res.json({
      word,
      punjabi: punjabiMatch ? punjabiMatch[1].trim() : text.trim(),
      example: exampleMatch ? exampleMatch[1].trim() : '',
    });
  } catch (err) {
    console.error('Definition error:', err);
    res.status(500).json({ error: 'Failed to get definition. Please try again.' });
  }
});

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀  Server running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️   ANTHROPIC_API_KEY is not set — add it to a .env file\n');
  } else {
    console.log('✅  Anthropic API key found\n');
  }
});
