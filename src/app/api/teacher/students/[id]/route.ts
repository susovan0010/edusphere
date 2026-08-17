export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        class: true,
        section: true,
        attendances: {
          include: { subject: true },
          orderBy: { date: "desc" },
        },
        marks: {
          include: { subject: true },
          orderBy: { date: "desc" },
        },
        assignmentResults: {
          include: { assignment: true },
        },
        submissions: {
          include: { assignment: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const totalAtt = student.attendances.length;
    const presentAtt = student.attendances.filter((a) => a.status === "PRESENT").length;
    const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        rollNo: student.rollNo,
        className: student.class.name,
        sectionName: student.section.name,
        admissionYear: student.admissionYear,
        attendancePercentage: attPct,
      },
      attendances: student.attendances,
      marks: student.marks,
      results: student.assignmentResults,
      submissions: student.submissions,
    });
  } catch (error) {
    console.error("Student detail GET error:", error);
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 });
  }
}
