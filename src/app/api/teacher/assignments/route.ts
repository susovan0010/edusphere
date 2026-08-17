
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
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: true,
        section: { include: { class: true } },
        submissions: true,
        assignmentResults: true,
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Teacher assignments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
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

    const {
      subjectId,
      sectionId,
      title,
      description,
      type, // "DESCRIPTIVE" | "OBJECTIVE"
      dueDate,
      maxMarks,
      questionBankIds, // optional array of question bank IDs
      customQuestions, // optional array of { text, marks, options, correctAnswer }
    } = await req.json();

    if (!subjectId || !sectionId || !title || !type || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Section 5B: Gate access by TeacherSubject status
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: teacher.id,
        subjectId,
        sectionId,
      },
    });

    if (!teacherSubject || teacherSubject.status !== "APPROVED") {
      return NextResponse.json(
        {
          error:
            "Feature locked. You cannot issue assignments for this paper until Admin approves your proposal.",
        },
        { status: 403 }
      );
    }

    // 1. Create Assignment
    const assignment = await prisma.assignment.create({
      data: {
        subjectId,
        teacherId: teacher.id,
        sectionId,
        title,
        description: description || "",
        type,
        dueDate: new Date(dueDate),
        maxMarks: Number(maxMarks) || 100,
      },
    });

    // 2. Link Question Bank Questions
    let orderIndex = 1;
    if (questionBankIds && Array.isArray(questionBankIds)) {
      for (const qbId of questionBankIds) {
        const qb = await prisma.questionBank.findUnique({ where: { id: qbId } });
        if (qb) {
          await prisma.assignmentQuestion.create({
            data: {
              assignmentId: assignment.id,
              questionBankId: qb.id,
              order: orderIndex++,
              marks: qb.defaultMarks,
              options: qb.options,
              correctAnswer: qb.correctAnswer,
            },
          });
        }
      }
    }

    // 3. Link Custom Questions
    if (customQuestions && Array.isArray(customQuestions)) {
      for (const cq of customQuestions) {
        await prisma.assignmentQuestion.create({
          data: {
            assignmentId: assignment.id,
            customQuestionText: cq.text,
            order: orderIndex++,
            marks: Number(cq.marks) || 5,
            options: cq.options ? JSON.stringify(cq.options) : null,
            correctAnswer: cq.correctAnswer || null,
          },
        });
      }
    }

    // 4. Section 5A Requirement: Instantly notify all enrolled students in the section
    const enrolledStudents = await prisma.student.findMany({
      where: { sectionId },
      include: { user: true },
    });

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });

    for (const student of enrolledStudents) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: `New Assignment: ${title}`,
          message: `${session.user.name} published a new ${
            type === "OBJECTIVE" ? "objective quiz" : "descriptive assignment"
          } for ${subject?.code || "your paper"}. Due on ${new Date(dueDate).toLocaleDateString()}.`,
          type: "ASSIGNMENT",
          relatedId: assignment.id,
        },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      targetTable: "Assignment",
      targetId: assignment.id,
      newValue: { title, type, sectionId, studentCount: enrolledStudents.length },
    });

    return NextResponse.json({
      success: true,
      assignment,
      notifiedStudentsCount: enrolledStudents.length,
    });
  } catch (error) {
    console.error("Teacher assignment creation error:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
