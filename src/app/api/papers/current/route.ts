
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session.user;

    // Get current semester
    const currentSem = await prisma.semester.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSem) {
      return NextResponse.json({ papers: [], semester: null });
    }

    if (role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
          section: {
            include: {
              semester: true,
            },
          },
        },
      });

      if (!student) {
        return NextResponse.json({ papers: [] });
      }

      // Fetch subjects for this student's class and current semester
      const subjects = await prisma.subject.findMany({
        where: {
          classId: student.classId,
          semesterId: currentSem.id,
        },
        include: {
          class: true,
          semester: true,
          teacherSubjects: {
            where: { sectionId: student.sectionId, status: "APPROVED" },
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      const papers = subjects.map((subj) => ({
        id: subj.id,
        code: subj.code,
        name: subj.name,
        credits: subj.credits,
        className: subj.class.name,
        teacherName: subj.teacherSubjects[0]?.teacher.user.name || "Faculty Pending",
      }));

      return NextResponse.json({ papers, semester: currentSem });
    } else if (role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher) {
        return NextResponse.json({ papers: [] });
      }

      // Fetch teacher's assigned or proposed subjects for current semester
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: {
          teacherId: teacher.id,
          subject: {
            semesterId: currentSem.id,
          },
        },
        include: {
          subject: {
            include: {
              class: true,
            },
          },
          section: true,
        },
      });

      const papers = teacherSubjects.map((ts) => ({
        id: ts.subject.id,
        code: ts.subject.code,
        name: ts.subject.name,
        credits: ts.subject.credits,
        className: ts.subject.class.name,
        sectionName: ts.section.name,
        status: ts.status,
      }));

      return NextResponse.json({ papers, semester: currentSem });
    } else {
      // Admin: all current semester subjects
      const subjects = await prisma.subject.findMany({
        where: { semesterId: currentSem.id },
        include: { class: true },
      });

      const papers = subjects.map((subj) => ({
        id: subj.id,
        code: subj.code,
        name: subj.name,
        credits: subj.credits,
        className: subj.class.name,
      }));

      return NextResponse.json({ papers, semester: currentSem });
    }
  } catch (error) {
    console.error("Error fetching current papers:", error);
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 });
  }
}
