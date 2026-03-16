import { useState, useCallback, useRef } from 'react';
import { getInterviewFeedback } from '../api';
import type { InterviewFeedback } from '../api';

// ── Canada Post Letter Carrier question bank ──────────────────────────────────
const CANADA_POST_QUESTIONS = [
  {
    question:
      'Describe a time when the company you worked for provided poor customer service which resulted in a customer not being pleased. How did you handle this situation?',
    punjabi:
      'ਦੱਸੋ ਕਦੋਂ ਤੁਹਾਡੀ ਕੰਪਨੀ ਨੇ ਮਾੜੀ ਗਾਹਕ ਸੇਵਾ ਦਿੱਤੀ ਜਿਸ ਨਾਲ ਗਾਹਕ ਨਾਖੁਸ਼ ਹੋਇਆ। ਤੁਸੀਂ ਇਹ ਕਿਵੇਂ ਸੰਭਾਲਿਆ?',
    tip: 'Use a real example. Describe what you did to fix the problem and make the customer feel heard.',
  },
  {
    question:
      'You noticed that a new employee seems to be having trouble finding his/her way around the depot. What would you do?',
    punjabi:
      'ਤੁਸੀਂ ਦੇਖਿਆ ਕਿ ਇੱਕ ਨਵੇਂ ਕਰਮਚਾਰੀ ਨੂੰ ਡਿੱਪੋ ਵਿੱਚ ਰਸਤਾ ਲੱਭਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੋ ਰਹੀ ਹੈ। ਤੁਸੀਂ ਕੀ ਕਰੋਗੇ?',
    tip: 'Show teamwork and initiative. Offer to help and make them feel welcome.',
  },
  {
    question:
      'You report to work, go out on the floor to start your shift, and see a potential hazardous situation. There is no one around. How would you handle the situation?',
    punjabi:
      'ਤੁਸੀਂ ਕੰਮ \'ਤੇ ਆਉਂਦੇ ਹੋ ਅਤੇ ਫ਼ਰਸ਼ \'ਤੇ ਇੱਕ ਖ਼ਤਰਨਾਕ ਸਥਿਤੀ ਦੇਖਦੇ ਹੋ। ਕੋਈ ਵੀ ਆਲੇ-ਦੁਆਲੇ ਨਹੀਂ ਹੈ। ਤੁਸੀਂ ਕੀ ਕਰੋਗੇ?',
    tip: 'Safety first. Describe the steps you would take immediately to protect yourself and others.',
  },
  {
    question:
      'Tell me about yourself and why you want to work as a Letter Carrier for Canada Post.',
    punjabi:
      'ਆਪਣੇ ਬਾਰੇ ਦੱਸੋ ਅਤੇ ਦੱਸੋ ਕਿ ਤੁਸੀਂ ਕੈਨੇਡਾ ਪੋਸਟ ਵਿੱਚ ਲੈਟਰ ਕੈਰੀਅਰ ਕਿਉਂ ਬਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    tip: 'Mention reliability, physical fitness, love of working outdoors, and serving the community.',
  },
  {
    question:
      'This job requires walking 15–20 km per day and lifting packages up to 50 lbs. How do you prepare yourself physically for this kind of demanding work?',
    punjabi:
      'ਇਸ ਨੌਕਰੀ ਵਿੱਚ ਰੋਜ਼ਾਨਾ 15–20 ਕਿਲੋਮੀਟਰ ਤੁਰਨਾ ਅਤੇ 50 ਪੌਂਡ ਤੱਕ ਦੇ ਪਾਰਸਲ ਚੁੱਕਣੇ ਪੈਂਦੇ ਹਨ। ਤੁਸੀਂ ਕਿਵੇਂ ਸਰੀਰਕ ਤੌਰ \'ਤੇ ਤਿਆਰ ਰਹਿੰਦੇ ਹੋ?',
    tip: 'Mention staying active, healthy habits, and any physical work experience you have.',
  },
  {
    question:
      'How do you handle working outdoors in all types of weather — including heavy rain, snow, and extreme cold?',
    punjabi:
      'ਤੁਸੀਂ ਹਰ ਮੌਸਮ ਵਿੱਚ ਬਾਹਰ ਕੰਮ ਕਰਨ ਬਾਰੇ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰਦੇ ਹੋ — ਮੀਂਹ, ਬਰਫ਼ ਅਤੇ ਸਖ਼ਤ ਠੰਡ ਵਿੱਚ?',
    tip: 'Be positive. Mention dressing properly for weather and past outdoor work experience.',
  },
  {
    question:
      'Describe a time when you had to manage a heavy workload under a tight deadline. How did you handle it?',
    punjabi:
      'ਦੱਸੋ ਕਦੋਂ ਤੁਹਾਨੂੰ ਸਮੇਂ ਦੀ ਦਬਾਅ ਹੇਠ ਬਹੁਤ ਜ਼ਿਆਦਾ ਕੰਮ ਕਰਨਾ ਪਿਆ। ਤੁਸੀਂ ਕਿਵੇਂ ਸੰਭਾਲਿਆ?',
    tip: 'Give a specific example. Show that you stay calm, prioritize tasks, and keep working steadily.',
  },
  {
    question:
      'How do you make sure that mail and packages are delivered accurately to the correct address every time?',
    punjabi:
      'ਤੁਸੀਂ ਕਿਵੇਂ ਯਕੀਨੀ ਕਰਦੇ ਹੋ ਕਿ ਡਾਕ ਅਤੇ ਪਾਰਸਲ ਹਮੇਸ਼ਾ ਸਹੀ ਪਤੇ \'ਤੇ ਪਹੁੰਚੇ?',
    tip: 'Mention double-checking addresses, careful sorting, and taking your time to be accurate.',
  },
  {
    question:
      'What would you do if a customer is not home and the package requires a signature?',
    punjabi:
      'ਜੇ ਗਾਹਕ ਘਰ \'ਤੇ ਨਹੀਂ ਅਤੇ ਪਾਰਸਲ \'ਤੇ ਦਸਤਖਤ ਜ਼ਰੂਰੀ ਹਨ, ਤੁਸੀਂ ਕੀ ਕਰੋਗੇ?',
    tip: 'Follow Canada Post procedure: leave a notice card with pickup instructions.',
  },
  {
    question:
      'Describe a time when you showed up consistently and reliably for a job, even when conditions were difficult.',
    punjabi:
      'ਦੱਸੋ ਕਦੋਂ ਤੁਸੀਂ ਔਖੀਆਂ ਹਾਲਤਾਂ ਵਿੱਚ ਵੀ ਭਰੋਸੇਯੋਗਤਾ ਨਾਲ ਕੰਮ \'ਤੇ ਆਉਂਦੇ ਰਹੇ।',
    tip: 'Give a specific example that shows your dedication and dependability as an employee.',
  },
];

const SCORE_CONFIG = {
  good: { label: 'Great answer!', punLabel: 'ਸ਼ਾਨਦਾਰ ਜਵਾਬ!', color: 'score-good' },
  ok: { label: 'Good start!', punLabel: 'ਚੰਗੀ ਸ਼ੁਰੂਆਤ!', color: 'score-ok' },
  'needs-work': { label: 'Keep practicing!', punLabel: 'ਹੋਰ ਅਭਿਆਸ ਕਰੋ!', color: 'score-needs-work' },
};

function pickNextQuestion(
  current: number | null,
  seen: Set<number>,
  total: number,
): number {
  // Reset if all questions have been seen
  const pool = seen.size >= total
    ? Array.from({ length: total }, (_, i) => i)
    : Array.from({ length: total }, (_, i) => i).filter((i) => !seen.has(i) && i !== current);

  return pool[Math.floor(Math.random() * pool.length)];
}

export function InterviewPractice() {
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionNum, setQuestionNum] = useState(0);
  const seenRef = useRef<Set<number>>(new Set());

  const question = questionIndex !== null ? CANADA_POST_QUESTIONS[questionIndex] : null;

  const handleGetQuestion = useCallback(() => {
    const next = pickNextQuestion(questionIndex, seenRef.current, CANADA_POST_QUESTIONS.length);
    seenRef.current.add(next);
    setQuestionIndex(next);
    setAnswer('');
    setFeedback(null);
    setError(null);
    setQuestionNum((n) => n + 1);
  }, [questionIndex]);

  const handleGetFeedback = useCallback(async () => {
    if (!question || !answer.trim()) return;
    setIsLoadingFeedback(true);
    setError(null);
    setFeedback(null);

    try {
      const fb = await getInterviewFeedback(
        question.question,
        answer.trim(),
        'Canada Post Letter Carrier',
      );
      setFeedback(fb);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [question, answer]);

  const scoreInfo = feedback ? SCORE_CONFIG[feedback.score] ?? SCORE_CONFIG.ok : null;

  return (
    <div className="interview-wrap">
      {/* Header card */}
      <div className="controls-card">
        <div className="canada-post-banner">
          <div className="canada-post-icon">📬</div>
          <div>
            <p className="canada-post-title">Canada Post — Letter Carrier</p>
            <p className="canada-post-sub">
              {CANADA_POST_QUESTIONS.length} ਅਭਿਆਸ ਸਵਾਲ / {CANADA_POST_QUESTIONS.length} practice questions
            </p>
          </div>
        </div>

        <button
          className="btn btn-generate"
          onClick={handleGetQuestion}
          disabled={isLoadingFeedback}
        >
          {question ? (
            <>ਅਗਲਾ ਸਵਾਲ / Next Question</>
          ) : (
            <>📬 ਇੰਟਰਵਿਊ ਸ਼ੁਰੂ ਕਰੋ / Start Interview</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {/* Question card */}
      {question && (
        <div className="interview-card">
          <div className="interview-q-header">
            <span className="interview-q-badge">ਸਵਾਲ {questionNum}</span>
            <span className="interview-q-total">of {CANADA_POST_QUESTIONS.length}</span>
          </div>

          <p className="interview-question-en">{question.question}</p>
          <p className="interview-question-pun">{question.punjabi}</p>

          <div className="interview-tip">
            <span className="interview-tip-label">Tip:</span> {question.tip}
          </div>

          {/* Answer area — hide after feedback submitted */}
          {!feedback && (
            <div className="interview-answer-area">
              <label className="interview-answer-label" htmlFor="answer-input">
                ਆਪਣਾ ਜਵਾਬ ਲਿਖੋ / Write your answer in English:
              </label>
              <textarea
                id="answer-input"
                className="interview-textarea"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here in English…"
                rows={5}
                disabled={isLoadingFeedback}
              />
              <button
                className="btn btn-interview-submit"
                onClick={handleGetFeedback}
                disabled={!answer.trim() || isLoadingFeedback}
              >
                {isLoadingFeedback ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ… / Checking…
                  </>
                ) : (
                  <>ਜਵਾਬ ਜਮ੍ਹਾਂ ਕਰੋ / Submit Answer</>
                )}
              </button>
            </div>
          )}

          {/* Feedback */}
          {feedback && scoreInfo && (
            <div className="interview-feedback">
              <div className={`interview-score ${scoreInfo.color}`}>
                <span className="score-label-en">{scoreInfo.label}</span>
                <span className="score-label-pun">{scoreInfo.punLabel}</span>
              </div>

              <div className="feedback-your-answer">
                <span className="feedback-section-label">Your answer:</span>
                <p className="feedback-answer-text">{answer}</p>
              </div>

              <div className="feedback-block">
                <span className="feedback-section-label">Feedback (English):</span>
                <p className="feedback-text-en">{feedback.feedbackEn}</p>
              </div>

              <div className="feedback-block">
                <span className="feedback-section-label feedback-section-label-pun">
                  ਫ਼ੀਡਬੈਕ (ਪੰਜਾਬੀ):
                </span>
                <p className="feedback-text-pun">{feedback.feedbackPunjabi}</p>
              </div>

              {feedback.example && (
                <div className="feedback-example">
                  <span className="feedback-section-label">Strong example answer:</span>
                  <p className="feedback-example-text">{feedback.example}</p>
                </div>
              )}

              <button
                className="btn btn-generate"
                onClick={handleGetQuestion}
              >
                ਅਗਲਾ ਸਵਾਲ / Next Question
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!question && !error && (
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <p className="empty-pun">
            ਕੈਨੇਡਾ ਪੋਸਟ ਇੰਟਰਵਿਊ ਦੀ ਤਿਆਰੀ ਕਰੋ
          </p>
          <p className="empty-en">
            Practice real Canada Post Letter Carrier interview questions
          </p>
        </div>
      )}
    </div>
  );
}
