
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters in length" },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "PASSWORD_CHANGE",
      targetTable: "User",
      targetId: session.user.id,
      newValue: { mustChangePassword: false },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
