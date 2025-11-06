// app/exam/customerservice/page.tsx
import ExamClient from '../[category]/client-exam';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { getUserQuestions } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function CustomerServiceExamPage() {
  const token = await getAuthCookie();
  if (!token) redirect('/');

  const payload = await verifyToken(token);
  if (!payload?.id) redirect('/');

  const userId = payload.id as string;
  const questions = await getUserQuestions(userId, 'customerservice');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20">
      <ExamClient
        userId={userId}
        category="customerservice"
        initialQuestions={questions}
      />
    </div>
  );
}