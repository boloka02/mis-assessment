// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [examId, setExamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) return setError('Enter an Examination ID');

    setLoading(true);
    setError('');
    setMsg('');

    try {
      const res = await fetch('/api/verify-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examination_id: examId }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        localStorage.setItem('exam_examination_id', examId);
        setMsg('Valid! Starting…');
        setTimeout(() => router.push(`/applicant/exam?id=${examId}`), 800);
      } else {
        setError(data.message || 'Invalid ID');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Welcome to
          </h1>
          <h2 className="mt-2 text-3xl font-semibold text-black dark:text-white sm:text-4xl">
            ADON Assessment
          </h2>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Please enter your Examination ID to begin.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {msg && <p className="text-center text-green-600 font-medium">{msg}</p>}
          {error && <p className="text-center text-red-600 font-medium">{error}</p>}

          <input
            type="text"
            value={examId}
            onChange={e => setExamId(e.target.value)}
            placeholder="Examination ID"
            className="w-full rounded-lg border border-zinc-300 bg-white px-5 py-3.5 text-base text-zinc-900 placeholder:text-zinc-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-white dark:focus:ring-white/10"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !examId.trim()}
            className="w-full rounded-full bg-black py-3.5 text-base font-medium text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? 'Verifying…' : 'Start Assessment'}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
          Powered by ADON | Secure & Confidential
        </p>
      </div>
    </div>
  );
}