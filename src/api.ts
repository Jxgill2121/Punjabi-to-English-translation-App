export interface Definition {
  word: string;
  punjabi: string;
  example: string;
}

// In-memory + localStorage cache for definitions
const defCache = new Map<string, Definition>();

export function clearDefinitionCache(word: string): void {
  const key = word.toLowerCase();
  defCache.delete(key);
  try { localStorage.removeItem(`def:${key}`); } catch { /* ignore */ }
}

/**
 * Streams a grade-appropriate English story from the server.
 * Calls onChunk for each text piece, onError if something goes wrong.
 */
export async function generateStory(
  grade: number,
  topic: string,
  onChunk: (text: string) => void,
  onError: (msg: string) => void,
): Promise<void> {
  const response = await fetch('/api/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade, topic }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to connect to story service');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') return;

      try {
        const parsed = JSON.parse(raw) as { text?: string; error?: string };
        if (parsed.error) {
          onError(parsed.error);
          return;
        }
        if (parsed.text) onChunk(parsed.text);
      } catch {
        // skip malformed lines
      }
    }
  }
}

/**
 * Fetches a Punjabi definition for a given English word.
 * Results are cached in memory and localStorage.
 */
export async function getDefinition(
  word: string,
  sentence: string,
): Promise<Definition> {
  const key = word.toLowerCase();

  // Check in-memory cache
  if (defCache.has(key)) return defCache.get(key)!;

  // Check localStorage cache
  try {
    const stored = localStorage.getItem(`def:${key}`);
    if (stored) {
      const parsed = JSON.parse(stored) as Definition;
      defCache.set(key, parsed);
      return parsed;
    }
  } catch { /* ignore */ }

  const response = await fetch('/api/define', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, sentence }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'Failed to get definition');
  }

  const def = await response.json() as Definition;
  defCache.set(key, def);
  try { localStorage.setItem(`def:${key}`, JSON.stringify(def)); } catch { /* ignore */ }
  return def;
}
