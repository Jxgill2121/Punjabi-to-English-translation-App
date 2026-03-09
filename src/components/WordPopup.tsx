import { useEffect } from 'react';
import { type Definition } from '../api';

interface WordPopupProps {
  word: string;
  definition: Definition | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSpeak: () => void;
  onRetry: () => void;
}

export function WordPopup({ word, definition, loading, error, onClose, onSpeak, onRetry }: WordPopupProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="popup-word">{word}</div>

        <button className="btn btn-speak" onClick={onSpeak}>
          🔊&nbsp;<span>ਸੁਣੋ</span>&nbsp;/ Listen Again
        </button>

        {loading && (
          <div className="def-loading">
            <span className="def-spinner" />
            <span>ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ… / Loading…</span>
          </div>
        )}

        {error && !loading && (
          <>
            <p className="popup-error">⚠️ {error}</p>
            <button className="btn btn-define" onClick={onRetry} style={{ marginTop: 10 }}>
              ↺ ਦੁਬਾਰਾ / Retry
            </button>
          </>
        )}

        {definition && !loading && (
          <div className="popup-definition">
            <div className="def-punjabi">{definition.punjabi}</div>
            {definition.example && (
              <div className="def-example">
                <span className="def-example-label">Example: </span>
                {definition.example}
              </div>
            )}
            <button className="btn-text-link" onClick={onRetry}>
              ↺ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ / Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
