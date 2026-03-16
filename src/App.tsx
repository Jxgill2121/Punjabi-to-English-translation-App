import { useState, useCallback, useRef } from 'react';
import { GradeSelector } from './components/GradeSelector';
import { StoryDisplay } from './components/StoryDisplay';
import { InterviewPractice } from './components/InterviewPractice';
import { generateStory } from './api';
import './App.css';

const TOPICS = [
  { value: 'animals', en: 'Animals', pun: 'ਜਾਨਵਰ' },
  { value: 'family', en: 'Family', pun: 'ਪਰਿਵਾਰ' },
  { value: 'school', en: 'School', pun: 'ਸਕੂਲ' },
  { value: 'nature', en: 'Nature', pun: 'ਕੁਦਰਤ' },
  { value: 'adventure', en: 'Adventure', pun: 'ਸਾਹਸ' },
  { value: 'food', en: 'Food', pun: 'ਖਾਣਾ' },
  { value: 'friendship', en: 'Friendship', pun: 'ਦੋਸਤੀ' },
  { value: 'science', en: 'Science', pun: 'ਵਿਗਿਆਨ' },
];

interface HistoryEntry {
  grade: number;
  topic: string;
  text: string;
}

function loadLearnedWords(): Set<string> {
  try {
    const stored = localStorage.getItem('learnedWords');
    if (stored) return new Set(JSON.parse(stored) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem('storyHistory');
    if (stored) return JSON.parse(stored) as HistoryEntry[];
  } catch { /* ignore */ }
  return [];
}

type Tab = 'stories' | 'interview';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('stories');
  const [grade, setGrade] = useState(1);
  const [topic, setTopic] = useState('animals');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStory, setHasStory] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [learnedWords, setLearnedWords] = useState<Set<string>>(loadLearnedWords);
  const [storyHistory, setStoryHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);

  const currentStoryRef = useRef('');

  const handleWordLearned = useCallback((word: string) => {
    setLearnedWords((prev) => {
      if (prev.has(word.toLowerCase())) return prev;
      const next = new Set(prev);
      next.add(word.toLowerCase());
      try { localStorage.setItem('learnedWords', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setStory('');
    setError(null);
    setHasStory(false);
    currentStoryRef.current = '';

    try {
      await generateStory(
        grade,
        topic,
        (chunk) => {
          currentStoryRef.current += chunk;
          setStory((prev) => prev + chunk);
          setHasStory(true);
        },
        (errMsg) => setError(errMsg),
      );

      // Save completed story to history
      const text = currentStoryRef.current;
      if (text) {
        const entry: HistoryEntry = { grade, topic, text };
        setStoryHistory((prev) => {
          const next = [entry, ...prev.filter((h) => h.text !== text)].slice(0, 5);
          try { localStorage.setItem('storyHistory', JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [grade, topic]);

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setStory(entry.text);
    setGrade(entry.grade);
    setTopic(entry.topic);
    setHasStory(true);
    setError(null);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <h1 className="title">
            <span className="title-pun">ਅੰਗਰੇਜ਼ੀ ਸਿੱਖੋ</span>
            <span className="title-en">Learn English with Stories</span>
          </h1>
          {activeTab === 'stories' ? (
            <>
              <p className="subtitle">
                ਕਿਸੇ ਵੀ ਸ਼ਬਦ ਨੂੰ ਛੂਹੋ — ਇਸਨੂੰ ਸੁਣੋ ਅਤੇ ਪੰਜਾਬੀ ਵਿੱਚ ਅਰਥ ਜਾਣੋ
              </p>
              <p className="subtitle subtitle-small">
                Tap any word to hear it pronounced and see its Punjabi meaning
              </p>
            </>
          ) : (
            <>
              <p className="subtitle">
                ਇੰਟਰਵਿਊ ਦੀ ਤਿਆਰੀ ਕਰੋ — ਸਵਾਲ ਪੰਜਾਬੀ ਅਤੇ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ
              </p>
              <p className="subtitle subtitle-small">
                Practice job interviews — questions shown in Punjabi and English
              </p>
            </>
          )}
          {learnedWords.size > 0 && (
            <div className="words-learned-badge">
              ✨ {learnedWords.size} ਸ਼ਬਦ ਸਿੱਖੇ / words learned
            </div>
          )}
        </div>
      </header>

      {/* ── Tab Nav ── */}
      <nav className="tab-nav">
        <button
          className={`tab-btn${activeTab === 'stories' ? ' active' : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          <span>📖</span>
          <span className="tab-en">Stories</span>
          <span className="tab-pun">ਕਹਾਣੀਆਂ</span>
        </button>
        <button
          className={`tab-btn${activeTab === 'interview' ? ' active' : ''}`}
          onClick={() => setActiveTab('interview')}
        >
          <span></span>
          <span className="tab-en">Interview Prep</span>
          <span className="tab-pun">ਇੰਟਰਵਿਊ</span>
        </button>
      </nav>

      {/* ── Controls ── */}
      <main className="main">
        {activeTab === 'interview' && <InterviewPractice />}
        <div className="controls-card" style={activeTab === 'interview' ? { display: 'none' } : {}}>
          <GradeSelector
            selectedGrade={grade}
            onGradeChange={setGrade}
            disabled={isGenerating}
          />

          {/* Topic selector */}
          <div className="topic-selector">
            <p className="section-label">
              ਵਿਸ਼ਾ ਚੁਣੋ&nbsp;<span className="section-label-en">/ Choose Topic</span>
            </p>
            <div className="topic-grid">
              {TOPICS.map(({ value, en, pun }) => (
                <button
                  key={value}
                  className={`topic-btn${topic === value ? ' active' : ''}`}
                  onClick={() => setTopic(value)}
                  disabled={isGenerating}
                >
                  <span className="topic-en">{en}</span>
                  <span className="topic-pun">{pun}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font size + generate button */}
          <div className="bottom-controls">
            <div className="font-size-controls">
              <span className="font-label">Aa</span>
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <button
                  key={size}
                  className={`font-btn font-btn-${size}${fontSize === size ? ' active' : ''}`}
                  onClick={() => setFontSize(size)}
                  title={size === 'sm' ? 'Small text' : size === 'md' ? 'Medium text' : 'Large text'}
                >
                  {size === 'sm' ? 'A−' : size === 'md' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            <button
              className="btn btn-generate"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  ਕਹਾਣੀ ਬਣ ਰਹੀ ਹੈ… / Generating…
                </>
              ) : hasStory ? (
                <>✨ ਨਵੀਂ ਕਹਾਣੀ / New Story</>
              ) : (
                <>📖 ਕਹਾਣੀ ਸ਼ੁਰੂ ਕਰੋ / Start Story</>
              )}
            </button>
          </div>
        </div>

        {/* ── Stories-only sections ── */}
        {activeTab === 'stories' && (
          <>
            {/* Error */}
            {error && (
              <div className="error-banner" role="alert">
                ⚠️ {error}
              </div>
            )}

            {/* Story */}
            {(story || isGenerating) && !error && (
              <StoryDisplay
                story={story}
                isGenerating={isGenerating}
                fontSize={fontSize}
                learnedWords={learnedWords}
                onWordLearned={handleWordLearned}
              />
            )}

            {/* Empty state */}
            {!story && !isGenerating && !error && (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <p className="empty-pun">
                  ਉੱਪਰ ਪੱਧਰ ਅਤੇ ਵਿਸ਼ਾ ਚੁਣੋ, ਫਿਰ ਕਹਾਣੀ ਸ਼ੁਰੂ ਕਰੋ
                </p>
                <p className="empty-en">
                  Choose a level and topic above, then tap &ldquo;Start Story&rdquo;
                </p>
              </div>
            )}

            {/* Story history */}
            {storyHistory.length > 0 && (
              <div className="history-section">
                <button
                  className="history-toggle"
                  onClick={() => setShowHistory((p) => !p)}
                >
                  {showHistory ? '▲' : '▼'}&nbsp;
                  ਪਿਛਲੀਆਂ ਕਹਾਣੀਆਂ / Previous Stories ({storyHistory.length})
                </button>
                {showHistory && (
                  <div className="history-list">
                    {storyHistory.map((entry, i) => (
                      <div key={i} className="history-item">
                        <div className="history-meta">
                          Grade {entry.grade} · {entry.topic.charAt(0).toUpperCase() + entry.topic.slice(1)}
                        </div>
                        <p className="history-preview">{entry.text.slice(0, 90)}…</p>
                        <button className="btn-text-link" onClick={() => loadFromHistory(entry)}>
                          ਪੜ੍ਹੋ / Read again →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
