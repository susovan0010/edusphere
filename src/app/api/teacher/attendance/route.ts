
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
          include: {
            subject: { include: { class: true, semester: true } },
            section: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const sectionId = searchParams.get("sectionId");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    // If subjectId & sectionId are specified, load the students list and existing attendance
    if (subjectId && sectionId) {
      const students = await prisma.student.findMany({
        where: { sectionId },
        include: { user: true },
        orderBy: { rollNo: "asc" },
      });

      let existingRecords: Record<string, string> = {};

      if (dateStr) {
        const queryDate = new Date(dateStr);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

        const attendances = await prisma.attendance.findMany({
          where: {
            subjectId,
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        attendances.forEach((a) => {
          existingRecords[a.studentId] = a.status;
        });
      }

      return NextResponse.json({
        subjectsTaught: teacher.subjectsTaught,
        students: students.map((s) => ({
          id: s.id,
          name: s.user.name,
          rollNo: s.rollNo,
          currentStatus: existingRecords[s.id] || "PRESENT", // Default to present for quick mobile marking
        })),
        hasExistingRecord: Object.keys(existingRecords).length > 0,
      });
    }

    return NextResponse.json({
      subjectsTaught: teacher.subjectsTaught,
      students: [],
    });
  } catch (error) {
    console.error("Teacher attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance data" }, { status: 500 });
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

    const { subjectId, sectionId, date, attendanceMap } = await req.json();
    // attendanceMap: Record<studentId, "PRESENT" | "ABSENT">

    if (!subjectId || !sectionId || !date || !attendanceMap) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const parsedDate = new Date(date);
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    // Clear previous attendance for this subject/date to allow clean updating
    await prisma.attendance.deleteMany({
      where: {
        subjectId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Bulk create updated records
    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      studentId,
      subjectId,
      date: parsedDate,
      status: status as string,
      markedBy: session.user.id,
    }));

    await prisma.attendance.createMany({
      data: records,
    });

    await logAudit({
      userId: session.user.id,
      action: "ATTENDANCE_MARK",
      targetTable: "Attendance",
      targetId: subjectId,
      newValue: {
        subjectId,
        sectionId,
        date,
        totalMarked: records.length,
        presentCount: records.filter((r) => r.status === "PRESENT").length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Attendance recorded for ${records.length} students.`,
    });
  } catch (error) {
    console.error("Teacher attendance POST error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
