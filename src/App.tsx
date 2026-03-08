import { useState, useCallback } from 'react';
import { GradeSelector } from './components/GradeSelector';
import { StoryDisplay } from './components/StoryDisplay';
import { generateStory } from './api';
import './App.css';

function App() {
  const [grade, setGrade] = useState(1);
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStory, setHasStory] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setStory('');
    setError(null);
    setHasStory(false);

    try {
      await generateStory(
        grade,
        (chunk) => {
          setStory((prev) => prev + chunk);
          setHasStory(true);
        },
        (errMsg) => setError(errMsg),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  }, [grade]);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <h1 className="title">
            <span className="title-pun">ਅੰਗਰੇਜ਼ੀ ਸਿੱਖੋ</span>
            <span className="title-en">Learn English with Stories</span>
          </h1>
          <p className="subtitle">
            ਕਿਸੇ ਵੀ ਸ਼ਬਦ ਨੂੰ ਛੂਹੋ — ਇਸਨੂੰ ਸੁਣੋ ਅਤੇ ਪੰਜਾਬੀ ਵਿੱਚ ਅਰਥ ਜਾਣੋ
          </p>
          <p className="subtitle subtitle-small">
            Tap any word to hear it pronounced and see its Punjabi meaning
          </p>
        </div>
      </header>

      {/* ── Controls ── */}
      <main className="main">
        <div className="controls-card">
          <GradeSelector
            selectedGrade={grade}
            onGradeChange={setGrade}
            disabled={isGenerating}
          />

          <button
            className="btn btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner" aria-hidden="true" />
                ਕਹਾਣੀ ਬਣ ਰਹੀ ਹੈ… / Generating story…
              </>
            ) : hasStory ? (
              <>✨ ਨਵੀਂ ਕਹਾਣੀ / New Story</>
            ) : (
              <>📖 ਕਹਾਣੀ ਸ਼ੁਰੂ ਕਰੋ / Start Story</>
            )}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-banner" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* ── Story ── */}
        {(story || isGenerating) && !error && (
          <StoryDisplay story={story} isGenerating={isGenerating} />
        )}

        {/* ── Empty state ── */}
        {!story && !isGenerating && !error && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p className="empty-pun">
              ਉੱਪਰ ਪੱਧਰ ਚੁਣੋ ਅਤੇ ਕਹਾਣੀ ਸ਼ੁਰੂ ਕਰੋ
            </p>
            <p className="empty-en">
              Choose your reading level above, then tap &ldquo;Start Story&rdquo;
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
