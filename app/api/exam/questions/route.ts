// app/api/exam/questions/route.ts
import { NextRequest } from "next/server";
import { getPool } from "@/lib/db";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return Response.json({ error: "Missing examId" }, { status: 400 });
    }

    const pool = await getPool();

    // Step 1: Find the exam
    const examQuery = await pool.query(
      `SELECT user_id, category FROM public.examini_details WHERE examination_id = $1`,
      [examId]
    );

    if (examQuery.rows.length === 0) {
      return Response.json({ error: "Exam not found" }, { status: 404 });
    }

    const { user_id, category } = examQuery.rows[0];

    // Step 2: Fetch all questions for this user + category
    const questionQuery = await pool.query(
      `SELECT id, question, options, correct_answer AS "correctAnswer", category
       FROM public.questions
       WHERE category = $1
       ORDER BY created_at ASC`,
      [category]
    );

    if (questionQuery.rows.length === 0) {
      return Response.json({ message: "No questions found", questions: [] });
    }

    // Step 3: Return the questions
    return Response.json({
      success: true,
      exam: { user_id, category },
      questions: questionQuery.rows,
    });
  } catch (err: any) {
    console.error("[/api/exam/questions] Error:", err.message);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
