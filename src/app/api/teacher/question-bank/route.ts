
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        subjectsTaught: {
          where: { status: "APPROVED" }, // Only approved subjects
          include: { subject: true },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const whereClause: any = { teacherId: teacher.id };
    if (subjectId) whereClause.subjectId = subjectId;

    const questions = await prisma.questionBank.findMany({
      where: whereClause,
      include: { subject: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      questions,
      approvedSubjects: teacher.subjectsTaught.map((ts) => ts.subject),
    });
  } catch (error) {
    console.error("Question bank GET error:", error);
    return NextResponse.json({ error: "Failed to fetch question bank" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const { subjectId, questionText, type, options, correctAnswer, defaultMarks } = await req.json();

    if (!subjectId || !questionText || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if paper is approved for this teacher (Section 5B feature gating)
    const isApproved = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: teacher.id,
        subjectId,
        status: "APPROVED",
      },
    });

    if (!isApproved) {
      return NextResponse.json(
        { error: "Access locked. This paper is awaiting Admin approval." },
        { status: 403 }
      );
    }

    const question = await prisma.questionBank.create({
      data: {
        subjectId,
        teacherId: teacher.id,
        questionText,
        type,
        options: options ? (typeof options === "string" ? options : JSON.stringify(options)) : null,
        correctAnswer: correctAnswer || null,
        defaultMarks: Number(defaultMarks) || 5,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      targetTable: "QuestionBank",
      targetId: question.id,
      newValue: { subjectId, type, defaultMarks },
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Question bank POST error:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing question ID" }, { status: 400 });
    }

    await prisma.questionBank.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Question bank DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
