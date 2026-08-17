
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driveAuth = await prisma.googleDriveAuth.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      connected: !!driveAuth,
      connectedAt: driveAuth?.connectedAt || null,
    });
  } catch (error) {
    console.error("GDrive status check error:", error);
    return NextResponse.json({ error: "Failed to check Drive status" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.googleDriveAuth.deleteMany({
      where: { userId: session.user.id },
    });

    await logAudit({
      userId: session.user.id,
      action: "DRIVE_DISCONNECT",
      targetTable: "GoogleDriveAuth",
      targetId: session.user.id,
    });

    return NextResponse.json({ success: true, connected: false });
  } catch (error) {
    console.error("GDrive disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect Drive" }, { status: 500 });
  }
}
