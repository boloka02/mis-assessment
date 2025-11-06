// app/api/exam/submit/route.ts
import { NextRequest } from 'next/server';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.id) return Response.json({ error: 'Invalid token' }, { status: 401 });

  const { userId, answers, examinationId } = await req.json();

  if (!answers || !examinationId) {
    return Response.json({ error: 'Missing data' }, { status: 400 });
  }

  const pool = await getPool();

  // Fetch correct answers
  const { rows: correctRows } = await pool.query(
    `SELECT id, correct_answer, category FROM public.questions WHERE user_id = $1`,
    [userId]
  );

  const correctMap = Object.fromEntries(
    correctRows.map(r => [r.id, { answer: r.correct_answer, category: r.category }])
  );

  // Calculate scores
  const scores = {
    english: 0,
    logical: 0,
    computerskill: 0,
    customerservice: 0,
  };

  Object.entries(answers).forEach(([qId, userAnswer]) => {
    const correct = correctMap[qId];
    if (correct && userAnswer === correct.answer) {
      const cat = correct.category;
      if (cat in scores) scores[cat as keyof typeof scores]++;
    }
  });

  // Save to DB
  await pool.query(
    `INSERT INTO public.exam_results 
     (user_id, examination_id, english_score, logical_score, computerskill_score, customerservice_score)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      userId,
      examinationId,
      scores.english,
      scores.logical,
      scores.computerskill,
      scores.customerservice,
    ]
  );

  return Response.json({ success: true, scores });
}