// app/applicant/result/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/** Inner component that uses useSearchParams */
function ResultContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) {
      setError('No Examination ID');
      setLoading(false);
      return;
    }

    // Still fetch to mark result as viewed (optional)
    fetch(`/api/result?id=${examId}`)
      .then(r => r.json())
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load');
        setLoading(false);
      });
  }, [examId]);

  if (loading) return <p className="text-center">Loading…</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-xl dark:bg-zinc-900">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-12 w-12 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Thank You!
          </h1>

          <p className="mb-2 text-lg text-zinc-700 dark:text-zinc-300">
            You have successfully completed the ADON Assessment.
          </p>

          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Your results have been submitted. The HR team will review your performance.
          </p>

          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            Examination ID: <span className="font-mono">{examId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Page component – wraps in Suspense */
export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-lg">Loading result…</div>}>
      <ResultContent />
    </Suspense>
  );
}