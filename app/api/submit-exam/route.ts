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
  } = body;

  if (!examination_id) {
    return NextResponse.json({ message: 'Missing examination_id' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO public.exam_results
         (examination_id, english_score, logical_score, computerskill_score, customerservice_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [examination_id, english, logical, computerskill, customerservice]
    );

    await client.query(
      `UPDATE public.examini_details SET status = 'completed' WHERE examination_id = $1`,
      [examination_id]
    );

    console.log('Scores saved:', { examination_id, english, logical, computerskill, customerservice });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Submit Error:', e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  } finally {
    client.release();
  }
}