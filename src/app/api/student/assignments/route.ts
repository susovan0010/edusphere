
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { sectionId: student.sectionId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        submissions: { where: { studentId: student.id } },
        assignmentResults: { where: { studentId: student.id } },
        _count: { select: { questions: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    const pending = [];
    const submitted = [];

    for (const a of assignments) {
      const isObjective = a.type === "OBJECTIVE";
      const hasResult = a.assignmentResults.length > 0;
      const submission = a.submissions[0];

      const item = {
        id: a.id,
        title: a.title,
        description: a.description,
        type: a.type,
        dueDate: a.dueDate,
        maxMarks: a.maxMarks,
        subjectCode: a.subject.code,
        subjectName: a.subject.name,
        teacherName: a.teacher.user.name,
        questionCount: a._count.questions,
        submission: submission || null,
        result: hasResult ? a.assignmentResults[0] : null,
      };

      if ((isObjective && hasResult) || (!isObjective && submission)) {
        submitted.push(item);
      } else {
        pending.push(item);
      }
    }

    return NextResponse.json({ pending, submitted });
  } catch (error) {
    console.error("Student assignments error:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}
