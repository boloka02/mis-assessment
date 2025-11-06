import { cookies } from 'next/headers';

export const GET = async () => {
  const cookieStore = await cookies();
  const examId = cookieStore.get('current_exam_id')?.value || null;

  return Response.json({ examId });
};
