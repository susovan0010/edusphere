
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      pendingApprovals,
      recentAudits,
      totalAttendances,
      presentAttendances,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.teacherSubject.count({ where: { status: "PENDING" } }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { timestamp: "desc" },
        include: { user: true },
      }),
      prisma.attendance.count(),
      prisma.attendance.count({ where: { status: "PRESENT" } }),
    ]);

    const currentSem = await prisma.semester.findFirst({ where: { isCurrent: true } });
    const globalAttendanceRate =
      totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 100;

    return NextResponse.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        pendingApprovals,
        globalAttendanceRate,
        currentSemester: currentSem?.label || "Active Term",
      },
      recentAudits,
    });
  } catch (error) {
    console.error("Admin dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
