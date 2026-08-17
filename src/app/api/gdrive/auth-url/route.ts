import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthUrl } from "@/lib/gdrive";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = getAuthUrl(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("GDrive auth url error:", error);
    return NextResponse.json({ error: "Failed to generate OAuth URL" }, { status: 500 });
  }
}
