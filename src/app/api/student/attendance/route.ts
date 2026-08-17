
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

    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: { subject: true },
      orderBy: { date: "asc" },
    });

    // Subject-wise grouping
    const subjectMap = new Map<string, { code: string; name: string; present: number; total: number; logs: any[] }>();

    attendances.forEach((att) => {
      if (!subjectMap.has(att.subjectId)) {
        subjectMap.set(att.subjectId, {
          code: att.subject.code,
          name: att.subject.name,
          present: 0,
          total: 0,
          logs: [],
        });
      }
      const entry = subjectMap.get(att.subjectId)!;
      entry.total += 1;
      if (att.status === "PRESENT") entry.present += 1;
      entry.logs.push({
        id: att.id,
        date: att.date,
        status: att.status,
      });
    });

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subId, data]) => ({
      subjectId: subId,
      code: data.code,
      name: data.name,
      present: data.present,
      absent: data.total - data.present,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 100,
      logs: data.logs,
    }));

    const total = attendances.length;
    const present = attendances.filter((a) => a.status === "PRESENT").length;
    const absent = total - present;

    // Timeline trend data (grouped by date)
    const dateMap = new Map<string, { date: string; present: number; total: number }>();
    attendances.forEach((att) => {
      const d = new Date(att.date).toISOString().split("T")[0];
      if (!dateMap.has(d)) {
        dateMap.set(d, { date: d, present: 0, total: 0 });
      }
      const item = dateMap.get(d)!;
      item.total += 1;
      if (att.status === "PRESENT") item.present += 1;
    });

    const timeline = Array.from(dateMap.values()).map((item) => ({
      date: item.date,
      percentage: Math.round((item.present / item.total) * 100),
      present: item.present,
      total: item.total,
    }));

    return NextResponse.json({
      summary: {
        total,
        present,
        absent,
        percentage: total > 0 ? Math.round((present / total) * 100) : 100,
      },
      pieData: [
        { name: "Present", value: present, color: "#6B8F71" },
        { name: "Absent", value: absent, color: "#A6453A" },
      ],
      timeline,
      subjectBreakdown,
    });
  } catch (error) {
    console.error("Student attendance error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
