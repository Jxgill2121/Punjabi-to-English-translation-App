import { useState, useCallback } from 'react';
import { WordPopup } from './WordPopup';

interface StoryDisplayProps {
  story: string;
  isGenerating: boolean;
}

type Token = { type: 'word'; value: string } | { type: 'other'; value: string };

/** Split text into clickable words and non-clickable punctuation/spaces. */
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /([A-Za-z'']+)|([^A-Za-z'']+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ type: 'word', value: match[1] });
    } else {
      tokens.push({ type: 'other', value: match[2] });
    }
  }
  return tokens;
}

/** Find the sentence in the story text that contains the given word. */
function getSentenceForWord(text: string, word: string): string {
  const parts = text.split(/[.!?]+/);
  const lower = word.toLowerCase();
  for (const part of parts) {
    if (part.toLowerCase().includes(lower)) return part.trim();
  }
  return text.slice(0, 300);
}

/** Speak a word using the Web Speech API. */
function speak(word: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.8;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

export function StoryDisplay({ story, isGenerating }: StoryDisplayProps) {
  const [selected, setSelected] = useState<{ word: string; sentence: string } | null>(null);

  const handleWordClick = useCallback(
    (word: string) => {
      // Speak immediately inside the gesture handler — required for iOS Safari,
      // which blocks speech synthesis triggered outside a direct user event.
      speak(word);
      const sentence = getSentenceForWord(story, word);
      setSelected({ word, sentence });
    },
    [story],
  );

  const handleSpeak = useCallback(() => {
    if (selected) speak(selected.word);
  }, [selected]);

  const tokens = tokenize(story);

  return (
    <div className="story-display">
      {/* Hint banner */}
      <div className="story-hint">
        <span className="hint-pun">ਕਿਸੇ ਵੀ ਸ਼ਬਦ ਨੂੰ ਛੂਹੋ</span>
        <span className="hint-sep"> • </span>
        <span className="hint-en">Tap any word to hear it &amp; get its meaning</span>
      </div>

      {/* Story text */}
      <div className="story-text" lang="en">
        {tokens.map((token, i) =>
          token.type === 'word' ? (
            <span
              key={i}
              className={`word${selected?.word === token.value ? ' word-active' : ''}`}
              onClick={() => handleWordClick(token.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleWordClick(token.value);
              }}
            >
              {token.value}
            </span>
          ) : (
            <span key={i} className="punct">
              {token.value}
            </span>
          ),
        )}
        {isGenerating && <span className="cursor" aria-hidden="true" />}
      </div>

      {selected && (
        <WordPopup
          word={selected.word}
          sentence={selected.sentence}
          onClose={() => setSelected(null)}
          onSpeak={handleSpeak}
        />
      )}
    </div>
  );
}
