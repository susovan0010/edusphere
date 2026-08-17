
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
      include: {
        class: true,
        section: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // 1. Overall Attendance Stats
    const totalAttendances = await prisma.attendance.count({
      where: { studentId: student.id },
    });
    const presentAttendances = await prisma.attendance.count({
      where: { studentId: student.id, status: "PRESENT" },
    });
    const attendancePercentage =
      totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 100;

    // 2. Marks summary
    const marks = await prisma.mark.findMany({
      where: { studentId: student.id },
      include: { subject: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    // 3. Current Semester Subjects & Per-Subject Attendance
    const currentSem = await prisma.semester.findFirst({ where: { isCurrent: true } });
    const subjects = currentSem
      ? await prisma.subject.findMany({
          where: { classId: student.classId, semesterId: currentSem.id },
          include: {
            teacherSubjects: {
              where: { sectionId: student.sectionId, status: "APPROVED" },
              include: { teacher: { include: { user: true } } },
            },
          },
        })
      : [];

    const subjectStats = await Promise.all(
      subjects.map(async (sub) => {
        const subTotal = await prisma.attendance.count({
          where: { studentId: student.id, subjectId: sub.id },
        });
        const subPresent = await prisma.attendance.count({
          where: { studentId: student.id, subjectId: sub.id, status: "PRESENT" },
        });
        const subMarks = await prisma.mark.findMany({
          where: { studentId: student.id, subjectId: sub.id },
        });

        const totalScored = subMarks.reduce((acc, m) => acc + m.marksObtained, 0);
        const maxPossible = subMarks.reduce((acc, m) => acc + m.maxMarks, 0);
        const marksPct = maxPossible > 0 ? Math.round((totalScored / maxPossible) * 100) : null;

        return {
          id: sub.id,
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          teacherName: sub.teacherSubjects[0]?.teacher.user.name || "Faculty Assigned",
          attendancePercentage: subTotal > 0 ? Math.round((subPresent / subTotal) * 100) : 100,
          totalLectures: subTotal,
          presentLectures: subPresent,
          marksPercentage: marksPct,
        };
      })
    );

    // 4. Assignments Status
    const allAssignments = await prisma.assignment.findMany({
      where: { sectionId: student.sectionId },
      include: {
        subject: true,
        submissions: { where: { studentId: student.id } },
        assignmentResults: { where: { studentId: student.id } },
      },
      orderBy: { dueDate: "asc" },
    });

    const pendingAssignments = allAssignments.filter((a) => {
      if (a.type === "OBJECTIVE") {
        return a.assignmentResults.length === 0;
      }
      return a.submissions.length === 0;
    });

    const completedAssignments = allAssignments.filter((a) => {
      if (a.type === "OBJECTIVE") {
        return a.assignmentResults.length > 0;
      }
      return a.submissions.length > 0;
    });

    return NextResponse.json({
      student: {
        id: student.id,
        name: session.user.name,
        email: session.user.email,
        rollNo: student.rollNo,
        className: student.class.name,
        sectionName: student.section.name,
        semesterLabel: currentSem?.label || "Current Term",
      },
      attendance: {
        overallPercentage: attendancePercentage,
        presentCount: presentAttendances,
        totalCount: totalAttendances,
      },
      subjectStats,
      recentMarks: marks,
      assignments: {
        pendingCount: pendingAssignments.length,
        completedCount: completedAssignments.length,
        pendingList: pendingAssignments.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
