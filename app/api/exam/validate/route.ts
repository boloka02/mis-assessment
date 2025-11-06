import { NextRequest, NextResponse } from "next/server";
import { validateExamId, startExam } from "@/lib/db";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { examId } = body;

    if (!examId || examId.trim() === "") {
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    const exam = await validateExamId(examId.trim());
    if (!exam) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 404 });
    }

    if (exam.status !== "pending") {
      return NextResponse.json({ error: "This exam has already started" }, { status: 403 });
    }

    await startExam(examId.trim());

    // ✅ Set cookie properly
    const res = NextResponse.json({ success: true, redirect: "/exam" });
    res.cookies.set("current_exam_id", examId.trim(), {
      path: "/",
      httpOnly: false,  // make it accessible from client
      maxAge: 60 * 60,  // 1 hour
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err: any) {
    console.error("[/api/exam/validate] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
