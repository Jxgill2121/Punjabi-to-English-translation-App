import { useState, useCallback } from 'react';
import { getInterviewQuestion, getInterviewFeedback } from '../api';
import type { InterviewQuestion, InterviewFeedback } from '../api';

const JOB_CATEGORIES = [
  { value: 'retail / store cashier', en: 'Retail', pun: 'ਦੁਕਾਨ' },
  { value: 'food service / restaurant', en: 'Food Service', pun: 'ਰੈਸਟੋਰੈਂਟ' },
  { value: 'childcare / babysitting', en: 'Childcare', pun: 'ਬੱਚਿਆਂ ਦੀ ਦੇਖਭਾਲ' },
  { value: 'cleaning / housekeeping', en: 'Cleaning', pun: 'ਸਫ਼ਾਈ' },
  { value: 'office assistant / admin', en: 'Office', pun: 'ਦਫ਼ਤਰ' },
  { value: 'healthcare aide / caregiver', en: 'Healthcare', pun: 'ਸਿਹਤ ਸੇਵਾ' },
];

const SCORE_CONFIG = {
  good: { label: 'Great answer!', punLabel: 'ਸ਼ਾਨਦਾਰ ਜਵਾਬ!', color: 'score-good', icon: '' },
  ok: { label: 'Good start!', punLabel: 'ਚੰਗੀ ਸ਼ੁਰੂਆਤ!', color: 'score-ok', icon: '' },
  'needs-work': { label: 'Keep practicing!', punLabel: 'ਹੋਰ ਅਭਿਆਸ ਕਰੋ!', color: 'score-needs-work', icon: '' },
};

export function InterviewPractice() {
  const [jobCategory, setJobCategory] = useState('retail / store cashier');
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);

  const handleGetQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setError(null);
    setQuestion(null);
    setAnswer('');
    setFeedback(null);

    try {
      const q = await getInterviewQuestion(jobCategory);
      setQuestion(q);
      setQuestionCount((c) => c + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [jobCategory]);

  const handleGetFeedback = useCallback(async () => {
    if (!question || !answer.trim()) return;
    setIsLoadingFeedback(true);
    setError(null);
    setFeedback(null);

    try {
      const fb = await getInterviewFeedback(question.question, answer.trim(), jobCategory);
      setFeedback(fb);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [question, answer, jobCategory]);

  const handleNextQuestion = useCallback(() => {
    setQuestion(null);
    setAnswer('');
    setFeedback(null);
    setError(null);
    handleGetQuestion();
  }, [handleGetQuestion]);

  const scoreInfo = feedback ? SCORE_CONFIG[feedback.score] ?? SCORE_CONFIG.ok : null;

  return (
    <div className="interview-wrap">
      {/* Job category selector */}
      <div className="controls-card">
        <div className="topic-selector">
          <p className="section-label">
            ਨੌਕਰੀ ਦੀ ਕਿਸਮ ਚੁਣੋ&nbsp;<span className="section-label-en">/ Choose Job Type</span>
          </p>
          <div className="topic-grid">
            {JOB_CATEGORIES.map(({ value, en, pun }) => (
              <button
                key={value}
                className={`topic-btn${jobCategory === value ? ' active' : ''}`}
                onClick={() => {
                  setJobCategory(value);
                  setQuestion(null);
                  setAnswer('');
                  setFeedback(null);
                  setError(null);
                }}
                disabled={isLoadingQuestion || isLoadingFeedback}
              >
                <span className="topic-en">{en}</span>
                <span className="topic-pun">{pun}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-generate"
          onClick={question ? handleNextQuestion : handleGetQuestion}
          disabled={isLoadingQuestion || isLoadingFeedback}
        >
          {isLoadingQuestion ? (
            <>
              <span className="spinner" aria-hidden="true" />
              ਸਵਾਲ ਆ ਰਿਹਾ ਹੈ… / Loading question…
            </>
          ) : question ? (
            <>ਅਗਲਾ ਸਵਾਲ / Next Question</>
          ) : (
            <>ਇੰਟਰਵਿਊ ਸ਼ੁਰੂ ਕਰੋ / Start Interview</>
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
      {question && !isLoadingQuestion && (
        <div className="interview-card">
          <div className="interview-q-header">
            <span className="interview-q-badge">
              {questionCount > 0 ? `ਸਵਾਲ ${questionCount}` : 'ਸਵਾਲ'}
            </span>
          </div>

          <p className="interview-question-en">{question.question}</p>
          <p className="interview-question-pun">{question.punjabi}</p>

          {question.tip && (
            <div className="interview-tip">
              <span className="interview-tip-label">Tip:</span> {question.tip}
            </div>
          )}

          {/* Answer area */}
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
                rows={4}
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
                <span className="score-icon">{scoreInfo.icon}</span>
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
                onClick={handleNextQuestion}
                disabled={isLoadingQuestion}
              >
                {isLoadingQuestion ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    ਸਵਾਲ ਆ ਰਿਹਾ ਹੈ…
                  </>
                ) : (
                  <>ਅਗਲਾ ਸਵਾਲ / Next Question</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!question && !isLoadingQuestion && !error && (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <p className="empty-pun">
            ਨੌਕਰੀ ਦੀ ਕਿਸਮ ਚੁਣੋ ਅਤੇ ਇੰਟਰਵਿਊ ਸ਼ੁਰੂ ਕਰੋ
          </p>
          <p className="empty-en">
            Choose a job type and tap "Start Interview" to practice
          </p>
        </div>
      )}
    </div>
  );
}
