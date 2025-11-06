import { NextResponse } from "next/server";
import { getUserQuestions, validateExamId } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("exam_id");

    if (!examId) {
      console.error("❌ Missing exam_id in query");
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    console.log("✅ Exam ID received:", examId);

    // Validate exam_id from examini_details
    const exam = await validateExamId(examId);
    console.log("🧩 Exam validation result:", exam);

    if (!exam) {
      console.error("❌ Exam ID not found in examini_details");
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 404 });
    }

    // For now, use a static user + category
    const dummyUserId = "00000000-0000-0000-0000-000000000000";
    const category = "english";

    console.log("📘 Fetching questions for:", { dummyUserId, category });

    const questions = await getUserQuestions(dummyUserId, category);
    console.log("✅ Questions fetched:", questions.length);

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error("🔥 Internal server error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
