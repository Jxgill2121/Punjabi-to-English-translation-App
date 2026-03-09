import { useState, useCallback, useRef } from 'react';
import { WordPopup } from './WordPopup';
import { getDefinition, clearDefinitionCache, type Definition } from '../api';

interface StoryDisplayProps {
  story: string;
  isGenerating: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  learnedWords: Set<string>;
  onWordLearned: (word: string) => void;
}

type Token = { type: 'word'; value: string } | { type: 'other'; value: string };

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

function getSentenceForWord(text: string, word: string): string {
  const parts = text.split(/[.!?]+/);
  const lower = word.toLowerCase();
  for (const part of parts) {
    if (part.toLowerCase().includes(lower)) return part.trim();
  }
  return text.slice(0, 300);
}

function speak(word: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.8;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

export function StoryDisplay({ story, isGenerating, fontSize, learnedWords, onWordLearned }: StoryDisplayProps) {
  const [selected, setSelected] = useState<{ word: string; sentence: string } | null>(null);
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [defLoading, setDefLoading] = useState(false);
  const [defError, setDefError] = useState<string | null>(null);
  const [isSpeakingFull, setIsSpeakingFull] = useState(false);

  // Track which word's definition is currently being fetched to avoid stale updates
  const activeWordRef = useRef('');

  const doFetch = useCallback(async (word: string, sentence: string) => {
    activeWordRef.current = word;
    setDefLoading(true);
    setDefinition(null);
    setDefError(null);
    try {
      const def = await getDefinition(word, sentence);
      if (activeWordRef.current === word) {
        setDefinition(def);
        onWordLearned(word);
      }
    } catch (err) {
      if (activeWordRef.current === word) {
        setDefError(err instanceof Error ? err.message : 'Could not load definition. Please try again.');
      }
    } finally {
      if (activeWordRef.current === word) {
        setDefLoading(false);
      }
    }
  }, [onWordLearned]);

  const handleWordClick = useCallback((word: string) => {
    speak(word);
    const sentence = getSentenceForWord(story, word);
    setSelected({ word, sentence });
    doFetch(word, sentence);
  }, [story, doFetch]);

  const handleRetry = useCallback(() => {
    if (!selected) return;
    clearDefinitionCache(selected.word);
    doFetch(selected.word, selected.sentence);
  }, [selected, doFetch]);

  const handleClose = useCallback(() => {
    activeWordRef.current = '';
    setSelected(null);
    setDefinition(null);
    setDefError(null);
  }, []);

  const handleReadAloud = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (isSpeakingFull) {
      window.speechSynthesis.cancel();
      setIsSpeakingFull(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(story);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.onend = () => setIsSpeakingFull(false);
      utterance.onerror = () => setIsSpeakingFull(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingFull(true);
    }
  }, [story, isSpeakingFull]);

  const tokens = tokenize(story);

  return (
    <div className="story-display">
      {/* Toolbar: hint + read-aloud button */}
      <div className="story-toolbar">
        <div className="story-hint">
          <span className="hint-pun">ਕਿਸੇ ਵੀ ਸ਼ਬਦ ਨੂੰ ਛੂਹੋ</span>
          <span className="hint-sep"> • </span>
          <span className="hint-en">Tap any word for meaning</span>
        </div>
        <button
          className={`btn-read-aloud${isSpeakingFull ? ' speaking' : ''}`}
          onClick={handleReadAloud}
          disabled={isGenerating || !story}
          title={isSpeakingFull ? 'ਰੋਕੋ / Stop' : 'ਪੂਰੀ ਕਹਾਣੀ ਸੁਣੋ / Read aloud'}
        >
          {isSpeakingFull ? '⏹' : '🔊'}
          <span>{isSpeakingFull ? 'ਰੋਕੋ' : 'ਸੁਣੋ'}</span>
        </button>
      </div>

      {/* Story text */}
      <div className={`story-text fs-${fontSize}`} lang="en">
        {tokens.map((token, i) => {
          if (token.type !== 'word') {
            return <span key={i} className="punct">{token.value}</span>;
          }
          const isActive = selected?.word === token.value;
          const isLearned = learnedWords.has(token.value.toLowerCase());
          return (
            <span
              key={i}
              className={`word${isActive ? ' word-active' : isLearned ? ' word-learned' : ''}`}
              onClick={() => handleWordClick(token.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleWordClick(token.value);
              }}
            >
              {token.value}
            </span>
          );
        })}
        {isGenerating && <span className="cursor" aria-hidden="true" />}
      </div>

      {selected && (
        <WordPopup
          word={selected.word}
          definition={definition}
          loading={defLoading}
          error={defError}
          onClose={handleClose}
          onSpeak={() => speak(selected.word)}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
