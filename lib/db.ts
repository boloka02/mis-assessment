import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await pool.connect();
  }
  return pool;
}

// ✅ Get user questions by category
export async function getUserQuestions(userId: string, category: string) {
  const pool = await getPool();
  const { rows } = await pool.query(
    `SELECT id, question, options, correct_answer AS "correctAnswer", category
     FROM public.questions 
     WHERE user_id = $1 AND category = $2 
     ORDER BY created_at DESC`,
    [userId, category]
  );
  return rows;
}

// ✅ Save question (requires category explicitly)
export async function saveQuestion(
  userId: string,
  q: { question: string; options: string[]; correctAnswer: number },
  category: string
) {
  const pool = await getPool();
  const { rows } = await pool.query(
    `INSERT INTO public.questions (user_id, question, options, correct_answer, category)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, q.question, q.options, q.correctAnswer, category]
  );
  return rows[0].id;
}

// ✅ Update question
export async function updateQuestion(id: string, q: {
  question: string;
  options: string[];
  correctAnswer: number;
}) {
  const pool = await getPool();
  await pool.query(
    `UPDATE public.questions 
     SET question = $1, options = $2, correct_answer = $3 
     WHERE id = $4`,
    [q.question, q.options, q.correctAnswer, id]
  );
}

// ✅ Delete question
export async function deleteQuestion(id: string) {
  const pool = await getPool();
  await pool.query(`DELETE FROM public.questions WHERE id = $1`, [id]);
}

// ✅ Validate Exam ID
export async function validateExamId(examId: string) {
  const pool = await getPool();
  const { rows } = await pool.query(
    `SELECT id, status 
     FROM public.examini_details 
     WHERE examination_id = $1`,
    [examId]
  );
  return rows[0] || null;
}

// ✅ Start Exam
export async function startExam(examId: string) {
  const pool = await getPool();
  const { rows } = await pool.query(
    `UPDATE public.examini_details 
     SET status = 'started', updated_at = CURRENT_TIMESTAMP 
     WHERE examination_id = $1 AND status = 'pending' 
     RETURNING id`,
    [examId]
  );
  return rows[0] || null;
}
