
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

    const marks = await prisma.mark.findMany({
      where: { studentId: student.id },
      include: { subject: true },
      orderBy: { date: "asc" },
    });

    // Objective assignment results
    const assignmentResults = await prisma.assignmentResult.findMany({
      where: { studentId: student.id },
      include: {
        assignment: {
          include: { subject: true },
        },
      },
    });

    // Structure data for Recharts subject comparison
    const subjectMap = new Map<string, { subject: string; ct: number | null; midsem: number | null; endsem: number | null; assignment: number | null }>();

    marks.forEach((m) => {
      if (!subjectMap.has(m.subject.code)) {
        subjectMap.set(m.subject.code, {
          subject: m.subject.code,
          ct: null,
          midsem: null,
          endsem: null,
          assignment: null,
        });
      }
      const item = subjectMap.get(m.subject.code)!;
      const percentage = Math.round((m.marksObtained / m.maxMarks) * 100);
      if (m.examType === "CT") item.ct = percentage;
      else if (m.examType === "MIDSEM") item.midsem = percentage;
      else if (m.examType === "ENDSEM") item.endsem = percentage;
      else if (m.examType === "ASSIGNMENT") item.assignment = percentage;
    });

    const chartData = Array.from(subjectMap.values());

    return NextResponse.json({
      marks,
      assignmentResults,
      chartData,
    });
  } catch (error) {
    console.error("Student marks error:", error);
    return NextResponse.json({ error: "Failed to fetch marks" }, { status: 500 });
  }
}
