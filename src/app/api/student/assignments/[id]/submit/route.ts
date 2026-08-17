export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getOrCreateSubmissionFolderInTeacherDrive } from "@/lib/gdrive";

export async function POST(
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
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const assignmentId = params.id;
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        teacher: { include: { user: true } },
        questions: { include: { questionBank: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const body = await req.json();

    // ================= 1. OBJECTIVE MCQ SUBMISSION =================
    if (assignment.type === "OBJECTIVE") {
      const { answers } = body; // Record<string, string> (questionId -> selectedOption)

      if (!answers || Object.keys(answers).length === 0) {
        return NextResponse.json({ error: "No answers provided" }, { status: 400 });
      }

      // Check if already submitted
      const existingResult = await prisma.assignmentResult.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: assignment.id,
            studentId: student.id,
          },
        },
      });

      if (existingResult) {
        return NextResponse.json(
          { error: "Objective quiz is already submitted and locked." },
          { status: 400 }
        );
      }

      let totalMarks = 0;
      let obtainedMarks = 0;
      const breakdown = [];

      for (const q of assignment.questions) {
        const correct = q.correctAnswer || q.questionBank?.correctAnswer;
        const selected = answers[q.id] || "";
        const isMatch = !!correct && selected.trim() === correct.trim();
        const marks = isMatch ? q.marks : 0;

        totalMarks += q.marks;
        obtainedMarks += marks;

        await prisma.objectiveResponse.upsert({
          where: {
            assignmentId_studentId_questionId: {
              assignmentId: assignment.id,
              studentId: student.id,
              questionId: q.id,
            },
          },
          update: {
            selectedAnswer: selected,
            isCorrect: isMatch,
            marksAwarded: marks,
            locked: true,
            submittedAt: new Date(),
          },
          create: {
            assignmentId: assignment.id,
            studentId: student.id,
            questionId: q.id,
            selectedAnswer: selected,
            isCorrect: isMatch,
            marksAwarded: marks,
            locked: true,
            submittedAt: new Date(),
          },
        });

        breakdown.push({
          questionId: q.id,
          selectedAnswer: selected,
          isCorrect: isMatch,
          marksAwarded: marks,
          maxMarks: q.marks,
        });
      }

      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

      const result = await prisma.assignmentResult.create({
        data: {
          assignmentId: assignment.id,
          studentId: student.id,
          totalMarks,
          obtainedMarks,
          percentage,
          autoCalculated: true,
        },
      });

      // Notification to student
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: "Quiz Auto-Graded!",
          message: `Your attempt on "${assignment.title}" has been scored: ${obtainedMarks}/${totalMarks} (${Math.round(
            percentage
          )}%).`,
          type: "RESULT",
          relatedId: assignment.id,
        },
      });

      // Also create an exam mark row if needed
      await prisma.mark.create({
        data: {
          studentId: student.id,
          subjectId: assignment.subjectId,
          examType: "ASSIGNMENT",
          marksObtained: obtainedMarks,
          maxMarks: totalMarks,
          enteredBy: "SYSTEM_AUTOGRADE",
        },
      });

      return NextResponse.json({
        success: true,
        type: "OBJECTIVE",
        totalMarks,
        obtainedMarks,
        percentage,
        breakdown,
      });
    }

    // ================= 2. DESCRIPTIVE SUBMISSION =================
    else {
      const { textContent, fileName, fileDataUrl } = body;

      const existingSubmission = await prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: assignment.id,
            studentId: student.id,
          },
        },
      });

      if (existingSubmission && existingSubmission.editCount >= 2) {
        return NextResponse.json(
          {
            error:
              "Submission is permanently locked. You have reached the maximum of 2 allowed edits (3 total submissions).",
          },
          { status: 400 }
        );
      }

      let driveFileId: string | null = null;
      let driveFileLink: string | null = null;

      // If teacher has Google Drive connected, attempt to write into Teacher's Drive
      try {
        const teacherDriveAuth = await prisma.googleDriveAuth.findUnique({
          where: { userId: assignment.teacher.userId },
        });

        if (teacherDriveAuth && fileName) {
          const { drive, folderId } = await getOrCreateSubmissionFolderInTeacherDrive({
            teacherUserId: assignment.teacher.userId,
            assignmentTitle: assignment.title,
            studentName: `${student.user.name} (${student.rollNo})`,
          });

          // Upload or update in teacher's Drive folder
          const uploadRes = await drive.files.create({
            requestBody: {
              name: fileName,
              parents: [folderId],
            },
            media: {
              mimeType: "text/plain",
              body: textContent || "Student submitted assignment",
            },
            fields: "id, webViewLink",
          });

          driveFileId = uploadRes.data.id || null;
          driveFileLink = uploadRes.data.webViewLink || null;
        }
      } catch (driveErr) {
        console.warn("Google Drive upload skipped/fallback:", driveErr);
      }

      const newEditCount = existingSubmission ? existingSubmission.editCount + 1 : 0;
      const isLocked = newEditCount >= 2;

      const submission = await prisma.submission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId: assignment.id,
            studentId: student.id,
          },
        },
        update: {
          textContent: textContent || null,
          driveFileId: driveFileId || existingSubmission?.driveFileId,
          driveFileLink: driveFileLink || existingSubmission?.driveFileLink || "https://drive.google.com",
          editCount: newEditCount,
          status: isLocked ? "LOCKED" : "SUBMITTED",
          lastEditedAt: new Date(),
        },
        create: {
          assignmentId: assignment.id,
          studentId: student.id,
          textContent: textContent || null,
          driveFileId: driveFileId || "simulated_drive_file_id",
          driveFileLink: driveFileLink || "https://drive.google.com",
          editCount: 0,
          status: "SUBMITTED",
        },
      });

      await logAudit({
        userId: session.user.id,
        action: "CREATE",
        targetTable: "Submission",
        targetId: submission.id,
        newValue: { editCount: newEditCount, status: submission.status },
      });

      return NextResponse.json({
        success: true,
        type: "DESCRIPTIVE",
        editCount: submission.editCount,
        remainingEdits: Math.max(0, 2 - submission.editCount),
        isLocked,
        submission,
      });
    }
  } catch (error) {
    console.error("Assignment submission error:", error);
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }
}
