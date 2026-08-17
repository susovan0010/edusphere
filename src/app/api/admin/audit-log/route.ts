
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const targetTable = searchParams.get("table");

    const where: any = {};
    if (action && action !== "ALL") where.action = action;
    if (targetTable && targetTable !== "ALL") where.targetTable = targetTable;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Audit log GET error:", error);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
