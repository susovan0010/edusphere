
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

    const pendingCount = await prisma.teacherSubject.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({ count: pendingCount });
  } catch (error) {
    console.error("Error fetching approvals count:", error);
    return NextResponse.json({ error: "Failed to fetch approvals count" }, { status: 500 });
  }
}
