// app/applicant/exam/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: 'english' | 'logical' | 'computerskill' | 'customerservice';
};

type AnswerMap = Record<string, string>;

const CATEGORY_ORDER = ['english', 'logical', 'computerskill', 'customerservice'] as const;
const CATEGORY_LABEL: Record<string, string> = {
  english: 'English',
  logical: 'Logical',
  computerskill: 'Computer Skill',
  customerservice: 'Customer Service',
};

const TIME_PER_CATEGORY = 5 * 60; // 5 minutes

/** Inner component that uses useSearchParams */
function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('id');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_CATEGORY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const topRef = useRef<HTMLDivElement>(null);

  // -----------------------------------------------------------------
  // Load questions
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!examId) {
      router.replace('/');
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/load-questions');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load questions');
        setQuestions(data.questions);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId, router]);

  // -----------------------------------------------------------------
  // Timer
  // -----------------------------------------------------------------
  useEffect(() => {
    if (loading || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, currentCategoryIdx]);

  const handleTimeUp = () => {
    if (currentCategoryIdx < CATEGORY_ORDER.length - 1) {
      setCurrentCategoryIdx(i => i + 1);
    } else {
      submitExam();
    }
  };

  // Reset timer + auto‑scroll when category changes
  useEffect(() => {
    setTimeLeft(TIME_PER_CATEGORY);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentCategoryIdx]);

  // -----------------------------------------------------------------
  // Group questions
  // -----------------------------------------------------------------
  const grouped = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const currentCategory = CATEGORY_ORDER[currentCategoryIdx];
  const currentQuestions = grouped[currentCategory] || [];
  const isLastCategory = currentCategoryIdx === CATEGORY_ORDER.length - 1;

  const goNext = () => {
    if (currentCategoryIdx < CATEGORY_ORDER.length - 1) {
      setCurrentCategoryIdx(i => i + 1);
    }
  };

  // -----------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------
  const submitExam = async () => {
    setSubmitting(true);
    setError('');

    try {
      const scores = { english: 0, logical: 0, computerskill: 0, customerservice: 0 };

      questions.forEach(q => {
        const user = answers[q.id];
        const correct = q.correct_answer;
        if (user != null && parseInt(user, 10) === correct) {
          scores[q.category as keyof typeof scores] += 1;
        }
      });

      const storedId = localStorage.getItem('exam_examination_id');
      if (!storedId) throw new Error('Exam ID missing');

      const res = await fetch('/api/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examination_id: storedId,
          english: scores.english,
          logical: scores.logical,
          computerskill: scores.computerskill,
          customerservice: scores.customerservice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submit failed');

      localStorage.removeItem('exam_examination_id');
      router.push(`/applicant/result?id=${storedId}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-lg">Loading…</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-black">
      {/* Auto‑scroll anchor */}
      <div ref={topRef} />

      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          ADON Assessment
        </h1>

        {/* Timer + Progress */}
        <div className="mb-6 text-center">
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            {CATEGORY_LABEL[currentCategory]} ({currentQuestions.length} questions)
          </p>

          <div className="mt-3 inline-block rounded-full bg-red-100 px-6 py-2 text-xl font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
            Time Left: {formatTime(timeLeft)}
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {CATEGORY_ORDER.map((c, i) => (
              <div
                key={c}
                className={`h-2 w-12 rounded-full transition-all ${
                  i === currentCategoryIdx
                    ? 'bg-black dark:bg-white'
                    : i < currentCategoryIdx
                    ? 'bg-green-500'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
          {currentQuestions.map((q, idx) => (
            <div key={q.id} className="border-b pb-6 last:border-0 dark:border-zinc-700">
              <p className="mb-4 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                Q{idx + 1}. {q.question}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === String(i);

                  return (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-center rounded-lg border p-4 transition-all
                        ${selected
                          ? 'border-black bg-black/5 dark:border-white dark:bg-white/10'
                          : 'border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                        }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={i}
                        checked={selected}
                        onChange={() => setAnswers({ ...answers, [q.id]: String(i) })}
                        className="sr-only"
                      />
                      <span className="ml-3 text-base text-zinc-700 dark:text-zinc-300">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentCategoryIdx(i => Math.max(0, i - 1))}
            disabled={currentCategoryIdx === 0}
            className="rounded-full bg-zinc-200 px-6 py-3 text-base font-medium text-zinc-800 transition-all hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Previous
          </button>

          {isLastCategory ? (
            <button
              onClick={submitExam}
              disabled={submitting}
              className="rounded-full bg-black px-8 py-3 text-base font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {submitting ? 'Submitting…' : 'Submit Exam'}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="rounded-full bg-black px-8 py-3 text-base font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Next Category
            </button>
          )}
        </div>

        {/* Low‑time warning */}
        {timeLeft <= 30 && timeLeft > 0 && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-pulse rounded-full bg-red-600 px-8 py-4 text-3xl font-bold text-white shadow-2xl">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Page component – wraps the content in Suspense */
export default function ExamPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-lg">Loading exam…</div>}>
      <ExamContent />
    </Suspense>
  );
}