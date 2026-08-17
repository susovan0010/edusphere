
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

    const pendingRequests = await prisma.teacherSubject.findMany({
      where: { status: "PENDING" },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        subject: {
          include: {
            class: true,
            semester: true,
          },
        },
        section: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action, notes } = await req.json();

    if (!requestId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
    }

    const teacherSubject = await prisma.teacherSubject.findUnique({
      where: { id: requestId },
      include: {
        teacher: { include: { user: true } },
        subject: true,
      },
    });

    if (!teacherSubject) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      const updated = await prisma.teacherSubject.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          approvedByAdminId: session.user.id,
          approvedAt: new Date(),
          notes: notes || null,
        },
      });

      // Notify teacher
      await prisma.notification.create({
        data: {
          userId: teacherSubject.teacher.userId,
          title: "Paper Proposal Approved!",
          message: `Admin approved your proposal to teach ${teacherSubject.subject.code} (${teacherSubject.subject.name}). Full grading and assignment features are now unlocked.`,
          type: "APPROVAL",
          relatedId: teacherSubject.subject.id,
        },
      });

      // Audit Log
      await logAudit({
        userId: session.user.id,
        action: "APPROVAL",
        targetTable: "TeacherSubject",
        targetId: requestId,
        newValue: { status: "APPROVED", notes },
      });

      return NextResponse.json({ success: true, status: "APPROVED" });
    } else {
      // REJECT
      await prisma.teacherSubject.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          notes: notes || "Rejected by administrator",
        },
      });

      // Notify teacher
      await prisma.notification.create({
        data: {
          userId: teacherSubject.teacher.userId,
          title: "Paper Proposal Rejected",
          message: `Your proposal to teach ${teacherSubject.subject.code} was declined by Admin.${
            notes ? ` Reason: ${notes}` : ""
          }`,
          type: "APPROVAL",
          relatedId: teacherSubject.subject.id,
        },
      });

      // Audit Log
      await logAudit({
        userId: session.user.id,
        action: "REJECTION",
        targetTable: "TeacherSubject",
        targetId: requestId,
        newValue: { status: "REJECTED", notes },
      });

      return NextResponse.json({ success: true, status: "REJECTED" });
    }
  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}
