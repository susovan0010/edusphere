export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignmentId = params.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: true,
        section: {
          include: {
            students: {
              include: { user: true },
            },
          },
        },
        questions: true,
        submissions: {
          include: { student: { include: { user: true } } },
        },
        assignmentResults: {
          include: { student: { include: { user: true } } },
        },
        objectiveResponses: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Build comprehensive submission table for all students in the class
    const studentSubmissions = assignment.section.students.map((student) => {
      const descriptiveSub = assignment.submissions.find((s) => s.studentId === student.id);
      const objectiveRes = assignment.assignmentResults.find((r) => r.studentId === student.id);
      const objectiveAnswers = assignment.objectiveResponses.filter((o) => o.studentId === student.id);

      return {
        studentId: student.id,
        studentName: student.user.name,
        studentEmail: student.user.email,
        rollNo: student.rollNo,
        submitted: !!descriptiveSub || !!objectiveRes,
        descriptiveSubmission: descriptiveSub || null,
        objectiveResult: objectiveRes || null,
        objectiveResponsesCount: objectiveAnswers.length,
      };
    });

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        dueDate: assignment.dueDate,
        maxMarks: assignment.maxMarks,
        subjectCode: assignment.subject.code,
        subjectName: assignment.subject.name,
      },
      students: studentSubmissions,
    });
  } catch (error) {
    console.error("Assignment submissions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignmentId = params.id;
    const { studentId, marksObtained, feedback } = await req.json();

    if (!studentId || marksObtained === undefined) {
      return NextResponse.json({ error: "Missing grading fields" }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { subject: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Record or update Mark row
    await prisma.mark.create({
      data: {
        studentId,
        subjectId: assignment.subjectId,
        examType: "ASSIGNMENT",
        marksObtained: Number(marksObtained),
        maxMarks: assignment.maxMarks,
        enteredBy: session.user.id,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: "Assignment Graded",
        message: `Your descriptive submission for "${assignment.title}" has been evaluated: ${marksObtained}/${assignment.maxMarks} marks.`,
        type: "RESULT",
        relatedId: assignment.id,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "GRADE",
      targetTable: "Mark",
      targetId: assignment.id,
      newValue: { studentId, marksObtained, maxMarks: assignment.maxMarks },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json({ error: "Failed to submit grade" }, { status: 500 });
  }
}
