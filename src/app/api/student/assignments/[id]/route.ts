export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Utility: Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const assignmentId = params.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        questions: {
          include: {
            questionBank: true,
          },
        },
        submissions: { where: { studentId: student.id } },
        assignmentResults: { where: { studentId: student.id } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check existing snapshot
    let studentSet = await prisma.studentAssignmentSet.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: student.id,
        },
      },
    });

    let questionOrder: string[] = [];
    let optionOrderMap: Record<string, string[]> = {};

    if (studentSet) {
      questionOrder = JSON.parse(studentSet.shuffledQuestionOrder);
      if (studentSet.shuffledOptionOrder) {
        optionOrderMap = JSON.parse(studentSet.shuffledOptionOrder);
      }
    } else {
      // Generate new per-student shuffled snapshot
      const rawQuestionIds = assignment.questions.map((q) => q.id);
      questionOrder = shuffleArray(rawQuestionIds);

      // Shuffle options for MCQ questions
      assignment.questions.forEach((q) => {
        const rawOptions = q.options || q.questionBank?.options;
        if (rawOptions) {
          try {
            const parsed = JSON.parse(rawOptions);
            if (Array.isArray(parsed)) {
              optionOrderMap[q.id] = shuffleArray(parsed);
            }
          } catch (e) {
            console.error("Error parsing options for shuffle", e);
          }
        }
      });

      studentSet = await prisma.studentAssignmentSet.create({
        data: {
          assignmentId: assignment.id,
          studentId: student.id,
          shuffledQuestionOrder: JSON.stringify(questionOrder),
          shuffledOptionOrder: JSON.stringify(optionOrderMap),
        },
      });
    }

    // Build question map for fast lookup
    const qMap = new Map(assignment.questions.map((q) => [q.id, q]));

    // Construct ordered questions list, hiding correctAnswer
    const orderedQuestions = questionOrder
      .map((qId, idx) => {
        const q = qMap.get(qId);
        if (!q) return null;

        const text = q.customQuestionText || q.questionBank?.questionText || "Question";
        const options = optionOrderMap[q.id] || (q.options ? JSON.parse(q.options) : []);

        return {
          id: q.id,
          order: idx + 1,
          marks: q.marks,
          questionText: text,
          options,
        };
      })
      .filter(Boolean);

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
        teacherName: assignment.teacher.user.name,
      },
      questions: orderedQuestions,
      submission: assignment.submissions[0] || null,
      result: assignment.assignmentResults[0] || null,
    });
  } catch (error) {
    console.error("Error fetching assignment attempt data:", error);
    return NextResponse.json({ error: "Failed to load assignment" }, { status: 500 });
  }
}
