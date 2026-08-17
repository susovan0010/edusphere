
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
            section: {
              include: {
                class: true,
                students: {
                  include: {
                    user: true,
                    attendances: true,
                    marks: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Deduplicate students across sections
    const studentMap = new Map<string, any>();

    teacher.subjectsTaught.forEach((ts) => {
      ts.section.students.forEach((s) => {
        if (!studentMap.has(s.id)) {
          const totalAtt = s.attendances.length;
          const presentAtt = s.attendances.filter((a) => a.status === "PRESENT").length;
          const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

          studentMap.set(s.id, {
            id: s.id,
            name: s.user.name,
            email: s.user.email,
            rollNo: s.rollNo,
            className: ts.section.class.name,
            sectionName: ts.section.name,
            attendancePercentage: attPct,
            isAtRisk: attPct < 75,
            totalMarksLogged: s.marks.length,
          });
        }
      });
    });

    return NextResponse.json(Array.from(studentMap.values()));
  } catch (error) {
    console.error("Teacher students GET error:", error);
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
  }
}
