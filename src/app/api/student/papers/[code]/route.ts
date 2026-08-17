export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: { class: true, section: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const subjectCode = params.code;

    const subject = await prisma.subject.findFirst({
      where: {
        code: subjectCode,
        classId: student.classId,
      },
      include: {
        class: true,
        semester: true,
        teacherSubjects: {
          where: { sectionId: student.sectionId, status: "APPROVED" },
          include: {
            teacher: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // 1. Attendance for this subject
    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id, subjectId: subject.id },
      orderBy: { date: "desc" },
    });

    const totalLectures = attendances.length;
    const presentLectures = attendances.filter((a) => a.status === "PRESENT").length;
    const attendancePercentage =
      totalLectures > 0 ? Math.round((presentLectures / totalLectures) * 100) : 100;

    // 2. Marks for this subject
    const marks = await prisma.mark.findMany({
      where: { studentId: student.id, subjectId: subject.id },
      orderBy: { date: "desc" },
    });

    // 3. Assignments for this subject
    const assignments = await prisma.assignment.findMany({
      where: { subjectId: subject.id, sectionId: student.sectionId },
      include: {
        submissions: { where: { studentId: student.id } },
        assignmentResults: { where: { studentId: student.id } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        credits: subject.credits,
        className: subject.class.name,
        sectionName: student.section.name,
        semesterLabel: subject.semester.label,
        teacherName: subject.teacherSubjects[0]?.teacher.user.name || "Faculty Assigned",
        teacherEmail: subject.teacherSubjects[0]?.teacher.user.email || null,
        teacherDept: subject.teacherSubjects[0]?.teacher.department || null,
      },
      attendance: {
        total: totalLectures,
        present: presentLectures,
        absent: totalLectures - presentLectures,
        percentage: attendancePercentage,
        recentLogs: attendances.slice(0, 10),
      },
      marks,
      assignments,
    });
  } catch (error) {
    console.error("Student paper detail error:", error);
    return NextResponse.json({ error: "Failed to fetch paper details" }, { status: 500 });
  }
}
