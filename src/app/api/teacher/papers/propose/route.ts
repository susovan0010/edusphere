
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

    const currentSem = await prisma.semester.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSem) {
      return NextResponse.json({ subjects: [], sections: [] });
    }

    const subjects = await prisma.subject.findMany({
      where: { semesterId: currentSem.id },
      include: { class: true },
    });

    const sections = await prisma.section.findMany({
      where: { semesterId: currentSem.id },
      include: { class: true },
    });

    return NextResponse.json({ subjects, sections, semester: currentSem });
  } catch (error) {
    console.error("Propose paper GET error:", error);
    return NextResponse.json({ error: "Failed to load subjects" }, { status: 500 });
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

    const { subjectId, sectionId, notes } = await req.json();

    if (!subjectId || !sectionId) {
      return NextResponse.json({ error: "Subject and Section are required" }, { status: 400 });
    }

    // Check if already mapped
    const existing = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: teacher.id,
        subjectId,
        sectionId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `You have already proposed or are assigned to this subject/section (${existing.status}).` },
        { status: 400 }
      );
    }

    // Section 5B: Creates TeacherSubject with status PENDING, requestedBy TEACHER
    const teacherSubject = await prisma.teacherSubject.create({
      data: {
        teacherId: teacher.id,
        subjectId,
        sectionId,
        status: "PENDING",
        requestedBy: "TEACHER",
        notes: notes || "Faculty self-assignment proposal",
      },
      include: {
        subject: true,
      },
    });

    // Notify all Admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Paper Self-Assignment Proposal",
          message: `${session.user.name} has proposed to teach ${teacherSubject.subject.code} (${teacherSubject.subject.name}). Review and approve in Approvals Queue.`,
          type: "APPROVAL",
          relatedId: teacherSubject.id,
        },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      targetTable: "TeacherSubject",
      targetId: teacherSubject.id,
      newValue: { status: "PENDING", requestedBy: "TEACHER", notes },
    });

    return NextResponse.json({
      success: true,
      message:
        "Paper proposal submitted! While awaiting admin approval, attendance marking is enabled; grading/assignment features will unlock upon approval.",
      teacherSubject,
    });
  } catch (error) {
    console.error("Propose paper POST error:", error);
    return NextResponse.json({ error: "Failed to submit proposal" }, { status: 500 });
  }
}
