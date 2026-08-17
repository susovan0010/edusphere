
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [classes, semesters, subjects] = await Promise.all([
      prisma.class.findMany({
        include: {
          sections: { include: { semester: true, students: true } },
          subjects: { include: { semester: true } },
        },
      }),
      prisma.semester.findMany({
        orderBy: { academicYear: "desc" },
      }),
      prisma.subject.findMany({
        include: {
          class: true,
          semester: true,
          teacherSubjects: {
            include: { teacher: { include: { user: true } }, section: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ classes, semesters, subjects });
  } catch (error) {
    console.error("Admin classes GET error:", error);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { entity } = body; // "CLASS" | "SECTION" | "SEMESTER" | "SUBJECT"

    if (entity === "CLASS") {
      const { name } = body;
      const created = await prisma.class.create({ data: { name } });
      await logAudit({
        userId: session.user.id,
        action: "CREATE",
        targetTable: "Class",
        targetId: created.id,
        newValue: { name },
      });
      return NextResponse.json({ success: true, created });
    } else if (entity === "SECTION") {
      const { name, classId, semesterId } = body;
      const created = await prisma.section.create({
        data: { name, classId, semesterId },
      });
      await logAudit({
        userId: session.user.id,
        action: "CREATE",
        targetTable: "Section",
        targetId: created.id,
        newValue: { name, classId, semesterId },
      });
      return NextResponse.json({ success: true, created });
    } else if (entity === "SEMESTER") {
      const { label, academicYear, isCurrent } = body;
      if (isCurrent) {
        await prisma.semester.updateMany({ data: { isCurrent: false } });
      }
      const created = await prisma.semester.create({
        data: { label, academicYear: Number(academicYear), isCurrent: !!isCurrent },
      });
      await logAudit({
        userId: session.user.id,
        action: "CREATE",
        targetTable: "Semester",
        targetId: created.id,
        newValue: { label, academicYear, isCurrent },
      });
      return NextResponse.json({ success: true, created });
    } else if (entity === "SUBJECT") {
      const { name, code, credits, classId, semesterId } = body;
      const created = await prisma.subject.create({
        data: {
          name,
          code,
          credits: Number(credits) || 4,
          classId,
          semesterId,
        },
      });
      await logAudit({
        userId: session.user.id,
        action: "CREATE",
        targetTable: "Subject",
        targetId: created.id,
        newValue: { name, code, credits, classId, semesterId },
      });
      return NextResponse.json({ success: true, created });
    }

    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  } catch (error) {
    console.error("Admin create entity error:", error);
    return NextResponse.json({ error: "Failed to create entity" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { entity, id } = body;

    if (entity === "SUBJECT") {
      // Section 5C: Paper Code and Name editing anytime
      const { name, code, credits, classId, semesterId } = body;
      const old = await prisma.subject.findUnique({ where: { id } });

      const updated = await prisma.subject.update({
        where: { id },
        data: {
          name,
          code,
          credits: Number(credits) || 4,
          classId,
          semesterId,
        },
      });

      await logAudit({
        userId: session.user.id,
        action: "UPDATE",
        targetTable: "Subject",
        targetId: id,
        oldValue: { name: old?.name, code: old?.code },
        newValue: { name, code, credits },
      });

      return NextResponse.json({ success: true, updated });
    } else if (entity === "SEMESTER") {
      const { label, academicYear, isCurrent } = body;
      if (isCurrent) {
        await prisma.semester.updateMany({ data: { isCurrent: false } });
      }

      const updated = await prisma.semester.update({
        where: { id },
        data: {
          label,
          academicYear: Number(academicYear),
          isCurrent: !!isCurrent,
        },
      });

      await logAudit({
        userId: session.user.id,
        action: "UPDATE",
        targetTable: "Semester",
        targetId: id,
        newValue: { label, isCurrent },
      });

      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  } catch (error) {
    console.error("Admin edit entity error:", error);
    return NextResponse.json({ error: "Failed to update entity" }, { status: 500 });
  }
}
