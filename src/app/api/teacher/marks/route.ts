
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

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const sectionId = searchParams.get("sectionId");
    const examType = searchParams.get("examType") || "CT";

    if (!subjectId || !sectionId) {
      return NextResponse.json({ error: "Missing subjectId or sectionId" }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { sectionId },
      include: {
        user: true,
        marks: {
          where: { subjectId, examType },
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      orderBy: { rollNo: "asc" },
    });

    return NextResponse.json(
      students.map((s) => ({
        studentId: s.id,
        name: s.user.name,
        rollNo: s.rollNo,
        marksObtained: s.marks[0]?.marksObtained ?? "",
        maxMarks: s.marks[0]?.maxMarks ?? 25,
      }))
    );
  } catch (error) {
    console.error("Teacher marks GET error:", error);
    return NextResponse.json({ error: "Failed to fetch marks" }, { status: 500 });
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

    const { subjectId, sectionId, examType, marksList, defaultMaxMarks } = await req.json();
    // marksList: Array<{ studentId, marksObtained, maxMarks }>

    if (!subjectId || !sectionId || !examType || !marksList) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Section 5B: Gate access
    const isApproved = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: teacher.id,
        subjectId,
        sectionId,
        status: "APPROVED",
      },
    });

    if (!isApproved) {
      return NextResponse.json(
        { error: "Access locked. You cannot enter marks for a paper awaiting Admin approval." },
        { status: 403 }
      );
    }

    const maxM = Number(defaultMaxMarks) || 25;

    for (const item of marksList) {
      if (item.marksObtained !== "" && item.marksObtained !== undefined) {
        await prisma.mark.create({
          data: {
            studentId: item.studentId,
            subjectId,
            examType,
            marksObtained: Number(item.marksObtained),
            maxMarks: Number(item.maxMarks) || maxM,
            enteredBy: session.user.id,
          },
        });
      }
    }

    await logAudit({
      userId: session.user.id,
      action: "GRADE",
      targetTable: "Mark",
      targetId: subjectId,
      newValue: { examType, studentCount: marksList.length },
    });

    return NextResponse.json({ success: true, message: "Marks saved successfully" });
  } catch (error) {
    console.error("Teacher marks POST error:", error);
    return NextResponse.json({ error: "Failed to save marks" }, { status: 500 });
  }
}
