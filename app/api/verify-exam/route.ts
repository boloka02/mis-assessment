// app/api/verify-exam/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export async function POST(req: Request) {
  const { examination_id } = await req.json();
  if (!examination_id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT status FROM public.examini_details WHERE examination_id = $1`,
      [examination_id]
    );

    if (!rows[0]) return NextResponse.json({ message: 'Invalid Examination ID' }, { status: 404 });
    if (rows[0].status !== 'pending')
      return NextResponse.json({ message: `Exam is already ${rows[0].status}` }, { status: 403 });

    await client.query(
      `UPDATE public.examini_details SET status = 'in_progress' WHERE examination_id = $1`,
      [examination_id]
    );

    return NextResponse.json({ valid: true });
  } catch (e: any) {
    console.error('Verify Exam Error:', e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  } finally {
    client.release();
  }
}