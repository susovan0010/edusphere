
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
          include: {
            subject: { include: { class: true } },
            section: { include: { students: true } },
          },
        },
        assignments: {
          include: {
            subject: true,
            submissions: true,
            assignmentResults: true,
          },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    // Calculate total students taught across assigned sections
    const studentIds = new Set<string>();
    teacher.subjectsTaught.forEach((ts) => {
      ts.section.students.forEach((s) => studentIds.add(s.id));
    });

    // Attendance stats for teacher's subjects
    const teacherSubjectIds = teacher.subjectsTaught.map((ts) => ts.subjectId);
    const totalLectures = await prisma.attendance.count({
      where: { subjectId: { in: teacherSubjectIds } },
    });
    const presentLectures = await prisma.attendance.count({
      where: { subjectId: { in: teacherSubjectIds }, status: "PRESENT" },
    });
    const avgAttendance =
      totalLectures > 0 ? Math.round((presentLectures / totalLectures) * 100) : 100;

    // Pending self-assignment count
    const pendingProposalsCount = teacher.subjectsTaught.filter(
      (ts) => ts.status === "PENDING"
    ).length;

    return NextResponse.json({
      teacher: {
        name: session.user.name,
        email: session.user.email,
        department: teacher.department,
        designation: teacher.designation,
      },
      stats: {
        totalStudentsTaught: studentIds.size,
        totalSubjectsCount: teacher.subjectsTaught.length,
        averageAttendance: avgAttendance,
        activeAssignmentsCount: teacher.assignments.length,
        pendingProposalsCount,
      },
      assignedPapers: teacher.subjectsTaught.map((ts) => ({
        id: ts.id,
        code: ts.subject.code,
        name: ts.subject.name,
        className: ts.subject.class.name,
        sectionName: ts.section.name,
        studentCount: ts.section.students.length,
        status: ts.status,
      })),
      assignments: teacher.assignments.slice(0, 5),
    });
  } catch (error) {
    console.error("Teacher dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
