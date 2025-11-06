// app/api/result/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT examination_id,
              english_score,
              logical_score,
              computerskill_score,
              customerservice_score,
              total_score,
              submitted_at
         FROM public.exam_results
        WHERE examination_id = $1
        ORDER BY submitted_at DESC
        LIMIT 1`,
      [id]
    );
    if (!rows[0]) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}