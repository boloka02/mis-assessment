// app/api/load-questions/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const ORDER = `CASE category
  WHEN 'english' THEN 1
  WHEN 'logical' THEN 2
  WHEN 'computerskill' THEN 3
  WHEN 'customerservice' THEN 4
END`;

export async function GET() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, question, options, correct_answer, category
      FROM public.questions
      ORDER BY ${ORDER}, created_at
    `);
    return NextResponse.json({ questions: rows });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}