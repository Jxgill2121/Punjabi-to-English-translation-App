import { useState, useEffect } from 'react';
import { getDefinition, type Definition } from '../api';

interface WordPopupProps {
  word: string;
  sentence: string;
  onClose: () => void;
  onSpeak: () => void;
}

export function WordPopup({ word, sentence, onClose, onSpeak }: WordPopupProps) {
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleGetDefinition = async () => {
    setLoading(true);
    setError(null);
    try {
      const def = await getDefinition(word, sentence);
      setDefinition(def);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load definition. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* The word */}
        <div className="popup-word">{word}</div>

        {/* Speak again button */}
        <button className="btn btn-speak" onClick={onSpeak}>
          🔊&nbsp;<span>ਸੁਣੋ</span>&nbsp;/ Listen Again
        </button>

        {/* Punjabi definition button — only shown if not yet loaded */}
        {!definition && (
          <button
            className="btn btn-define"
            onClick={handleGetDefinition}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="mini-spinner" />
                ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ… / Loading…
              </>
            ) : (
              <>📖&nbsp;ਪੰਜਾਬੀ ਵਿੱਚ ਅਰਥ&nbsp;/ Punjabi Meaning</>
            )}
          </button>
        )}

        {error && <p className="popup-error">⚠️ {error}</p>}

        {/* Definition panel */}
        {definition && (
          <div className="popup-definition">
            <div className="def-punjabi">{definition.punjabi}</div>
            {definition.example && (
              <div className="def-example">
                <span className="def-example-label">Example: </span>
                {definition.example}
              </div>
            )}
            {/* Allow re-fetching a fresher definition if needed */}
            <button
              className="btn-text-link"
              onClick={() => {
                setDefinition(null);
                setError(null);
              }}
            >
              ↺ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ / Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
