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
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const subjectCode = params.code;

    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: teacher.id,
        subject: { code: subjectCode },
      },
      include: {
        subject: {
          include: {
            class: true,
            semester: true,
            assignments: { where: { teacherId: teacher.id } },
            questionBank: { where: { teacherId: teacher.id } },
          },
        },
        section: {
          include: {
            students: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!teacherSubject) {
      return NextResponse.json({ error: "Paper not found for this teacher" }, { status: 404 });
    }

    const studentCount = teacherSubject.section.students.length;

    // Recent attendance stats for this subject
    const attendances = await prisma.attendance.findMany({
      where: { subjectId: teacherSubject.subjectId },
      orderBy: { date: "desc" },
    });

    const totalLectures = attendances.length;
    const presentLectures = attendances.filter((a) => a.status === "PRESENT").length;
    const avgAttendance =
      totalLectures > 0 ? Math.round((presentLectures / totalLectures) * 100) : 100;

    return NextResponse.json({
      teacherSubjectId: teacherSubject.id,
      status: teacherSubject.status, // "APPROVED" | "PENDING" | "REJECTED"
      notes: teacherSubject.notes,
      requestedBy: teacherSubject.requestedBy,
      subject: {
        id: teacherSubject.subject.id,
        code: teacherSubject.subject.code,
        name: teacherSubject.subject.name,
        credits: teacherSubject.subject.credits,
        className: teacherSubject.subject.class.name,
        sectionId: teacherSubject.section.id,
        sectionName: teacherSubject.section.name,
        semesterLabel: teacherSubject.subject.semester.label,
      },
      stats: {
        studentCount,
        averageAttendance: avgAttendance,
        assignmentsCount: teacherSubject.subject.assignments.length,
        questionBankCount: teacherSubject.subject.questionBank.length,
      },
      enrolledStudents: teacherSubject.section.students.map((s) => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        rollNo: s.rollNo,
      })),
    });
  } catch (error) {
    console.error("Teacher paper detail GET error:", error);
    return NextResponse.json({ error: "Failed to load paper detail" }, { status: 500 });
  }
}
