// app/admin/results/datatable.tsx
'use client';

import { format } from 'date-fns'; // ← correct import

interface Result {
  id: number;
  name: string;
  email: string;
  examination_id: string;
  english_score: number;
  logical_score: number;
  computerskill_score: number;
  customerservice_score: number;
  total_score: number;
  submitted_at: string;
}

export default function DataTable({ data }: { data: Result[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        No results found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Exam ID
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                English
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Logical
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Computer
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium">{row.name}</div>
                    <div className="text-xs text-zinc-500">{row.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{row.examination_id}</td>
                <td className="px-6 py-4 text-center text-sm font-medium">
                  {row.english_score}/5
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium">
                  {row.logical_score}/5
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium">
                  {row.computerskill_score}/5
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium">
                  {row.customerservice_score}/5
                </td>
                <td className="px-6 py-4 text-center text-sm font-bold text-blue-600">
                  {row.total_score}/20
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {format(new Date(row.submitted_at), 'MMM d, yyyy h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}