
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

    const students = await prisma.student.findMany({
      include: {
        user: true,
        class: true,
        section: true,
      },
      orderBy: { rollNo: "asc" },
    });

    const classes = await prisma.class.findMany({
      include: { sections: true },
    });

    return NextResponse.json({ students, classes });
  } catch (error) {
    console.error("Admin students GET error:", error);
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, rollNo, classId, sectionId, temporaryPassword, admissionYear } =
      await req.json();

    if (!name || !email || !rollNo || !classId || !sectionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tempPass = temporaryPassword || "Student@123";
    const passwordHash = await bcrypt.hash(tempPass, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "STUDENT",
        mustChangePassword: true, // Section 2A: Must change password on first login
        studentProfile: {
          create: {
            rollNo,
            classId,
            sectionId,
            admissionYear: Number(admissionYear) || new Date().getFullYear(),
          },
        },
      },
      include: { studentProfile: true },
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      targetTable: "Student",
      targetId: user.studentProfile!.id,
      newValue: { name, email, rollNo, classId, sectionId },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Admin student POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email or roll number already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, email, rollNo, classId, sectionId, admissionYear } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Section 5C: Full edit capability
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        name,
        email: email?.toLowerCase().trim(),
      },
    });

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        rollNo,
        classId,
        sectionId,
        admissionYear: admissionYear ? Number(admissionYear) : undefined,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      targetTable: "Student",
      targetId: id,
      oldValue: { rollNo: student.rollNo, classId: student.classId },
      newValue: { rollNo, classId, sectionId },
    });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error("Admin student PUT error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (student) {
      await prisma.user.delete({ where: { id: student.userId } });
      await logAudit({
        userId: session.user.id,
        action: "DELETE",
        targetTable: "Student",
        targetId: id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin student DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
