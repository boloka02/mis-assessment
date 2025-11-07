// app/api/submit-exam/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export async function POST(req: Request) {
  const body = await req.json();
  const {
    examination_id,
    english = 0,
    logical = 0,
    computerskill = 0,
    customerservice = 0,
    typing_wpm = 0,
    typing_accuracy = 0,
  } = body;

  if (!examination_id) {
    return NextResponse.json({ message: 'Missing examination_id' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query(
      `INSERT INTO public.exam_results
         (examination_id, english_score, logical_score, computerskill_score, customerservice_score, typing_wpm, typing_accuracy)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (examination_id) DO UPDATE SET
         english_score = EXCLUDED.english_score,
         logical_score = EXCLUDED.logical_score,
         computerskill_score = EXCLUDED.computerskill_score,
         customerservice_score = EXCLUDED.customerservice_score,
         typing_wpm = EXCLUDED.typing_wpm,
         typing_accuracy = EXCLUDED.typing_accuracy`,
      [examination_id, english, logical, computerskill, customerservice, typing_wpm, typing_accuracy]
    );

    await client.query(
      `UPDATE public.examini_details SET status = 'completed' WHERE examination_id = $1`,
      [examination_id]
    );

    console.log('SAVED →', { examination_id, typing_wpm, typing_accuracy });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('SUBMIT ERROR:', e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  } finally {
    client.release();
  }
}