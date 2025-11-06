// app/api/questions/route.ts
import { NextRequest } from 'next/server';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import {
  saveQuestion,
  updateQuestion,
  deleteQuestion,
  getUserQuestions,
} from '@/lib/db';

// 🟩 GET: Fetch questions by category
export async function GET(req: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.id) return Response.json({ error: 'Invalid token' }, { status: 401 });

  // Extract category from query params
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'english';

  // Fetch questions for this user and category
  const questions = await getUserQuestions(payload.id, category);
  return Response.json(questions);
}

// 🟦 POST: Create new question
export async function POST(req: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.id) return Response.json({ error: 'Invalid token' }, { status: 401 });

  const body = await req.json();

  // Validate required fields
  if (
    !body.question ||
    !Array.isArray(body.options) ||
    body.correctAnswer === undefined
  ) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Default category to english if not specified
  const category = body.category || 'english';

  // Validate category
  const validCategories = ['english', 'logical', 'computerskill', 'customerservice'];
  if (!validCategories.includes(category)) {
    return Response.json({ error: 'Invalid category' }, { status: 400 });
  }

  const id = await saveQuestion(
    payload.id,
    {
      question: body.question,
      options: body.options,
      correctAnswer: body.correctAnswer,
    },
    category
  );

  return Response.json({ id });
}

// 🟨 PUT: Update question
export async function PUT(req: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.id) return Response.json({ error: 'Invalid token' }, { status: 401 });

  const body = await req.json();

  if (
    !body.id ||
    !body.question ||
    !Array.isArray(body.options) ||
    body.correctAnswer === undefined
  ) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await updateQuestion(body.id, {
    question: body.question,
    options: body.options,
    correctAnswer: body.correctAnswer,
  });

  return Response.json({ success: true });
}

// 🟥 DELETE: Remove question by ID
export async function DELETE(req: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.id) return Response.json({ error: 'Invalid token' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

  await deleteQuestion(id);
  return Response.json({ success: true });
}
