
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
        subjectsTaught: {
          include: {
            subject: true,
            section: { include: { class: true } },
          },
        },
      },
    });

    const currentSem = await prisma.semester.findFirst({ where: { isCurrent: true } });
    const subjects = currentSem
      ? await prisma.subject.findMany({
          where: { semesterId: currentSem.id },
          include: { class: true },
        })
      : [];

    const sections = currentSem
      ? await prisma.section.findMany({
          where: { semesterId: currentSem.id },
          include: { class: true },
        })
      : [];

    return NextResponse.json({ teachers, subjects, sections });
  } catch (error) {
    console.error("Admin teachers GET error:", error);
    return NextResponse.json({ error: "Failed to load teachers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, department, designation, temporaryPassword, assignments } =
      await req.json();
    // assignments: Array<{ subjectId, sectionId }>

    if (!name || !email || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tempPass = temporaryPassword || "Teacher@123";
    const passwordHash = await bcrypt.hash(tempPass, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "TEACHER",
        mustChangePassword: true, // Section 2A: Must change password on first login
        teacherProfile: {
          create: {
            department,
            designation: designation || "Assistant Professor",
          },
        },
      },
      include: { teacherProfile: true },
    });

    // If initial assignments provided
    if (assignments && Array.isArray(assignments)) {
      for (const a of assignments) {
        if (a.subjectId && a.sectionId) {
          await prisma.teacherSubject.create({
            data: {
              teacherId: user.teacherProfile!.id,
              subjectId: a.subjectId,
              sectionId: a.sectionId,
              status: "APPROVED",
              requestedBy: "ADMIN",
              approvedByAdminId: session.user.id,
              approvedAt: new Date(),
            },
          });
        }
      }
    }

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      targetTable: "Teacher",
      targetId: user.teacherProfile!.id,
      newValue: { name, email, department, designation },
    });

    return NextResponse.json({ success: true, teacher: user });
  } catch (error: any) {
    console.error("Admin teacher POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, email, department, designation, assignSubjectId, assignSectionId } =
      await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing teacher ID" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Section 5C: Edit user & department details
    await prisma.user.update({
      where: { id: teacher.userId },
      data: {
        name,
        email: email?.toLowerCase().trim(),
      },
    });

    await prisma.teacher.update({
      where: { id },
      data: {
        department,
        designation,
      },
    });

    // Section 5C: Reassign or assign new subject/section
    if (assignSubjectId && assignSectionId) {
      await prisma.teacherSubject.upsert({
        where: {
          id: `${id}_${assignSubjectId}_${assignSectionId}`, // fallback
        },
        update: {
          status: "APPROVED",
        },
        create: {
          teacherId: id,
          subjectId: assignSubjectId,
          sectionId: assignSectionId,
          status: "APPROVED",
          requestedBy: "ADMIN",
          approvedByAdminId: session.user.id,
          approvedAt: new Date(),
        },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      targetTable: "Teacher",
      targetId: id,
      newValue: { name, email, department, designation },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin teacher PUT error:", error);
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing teacher ID" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (teacher) {
      await prisma.user.delete({ where: { id: teacher.userId } });
      await logAudit({
        userId: session.user.id,
        action: "DELETE",
        targetTable: "Teacher",
        targetId: id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin teacher DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
