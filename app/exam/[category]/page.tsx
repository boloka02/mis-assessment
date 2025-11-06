// app/exam/[category]/page.tsx
import ExamClient from './client-exam';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { getUserQuestions } from '@/lib/db';
import { redirect } from 'next/navigation';

const validCategories = ['english', 'logical', 'computerskill', 'customerservice'];

export default async function ExamPage({ params }: { params: { category: string } }) {
  const { category } = params;

  if (!validCategories.includes(category)) redirect('/');

  const token = await getAuthCookie();
  if (!token) redirect('/');

  const payload = await verifyToken(token);
  if (!payload?.id) redirect('/');

  const userId = payload.id as string;

  // ✅ Fetch questions for this category only
  const questions = await getUserQuestions(userId, category);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20">
      <ExamClient
        userId={userId}
        category={category}
        initialQuestions={questions}  // 👈 Array only
      />
    </div>
  );
}
