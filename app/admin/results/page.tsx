// app/admin/results/page.tsx
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { getPool } from '@/lib/db';
import { redirect } from 'next/navigation';
import DataTable from './datatable'; // ← now exists

export default async function AdminResults() {
  const token = await getAuthCookie();
  if (!token) redirect('/');

  const payload = await verifyToken(token);
  if (!payload?.id || payload.role !== 'admin') redirect('/');

  const pool = await getPool();
  const { rows } = await pool.query(`
    SELECT 
      r.*,
      u.name,
      u.email
    FROM public.exam_results r
    JOIN public.users u ON r.user_id = u.id
    ORDER BY r.submitted_at DESC
  `);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Exam Results</h1>
        <DataTable data={rows} />
      </div>
    </div>
  );
}