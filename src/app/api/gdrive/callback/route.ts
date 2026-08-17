
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

import { exchangeCodeForTokens } from "@/lib/gdrive";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId passed as state

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=oauth_missing_params", req.url));
  }

  try {
    await exchangeCodeForTokens(code, state);

    await logAudit({
      userId: state,
      action: "DRIVE_CONNECT",
      targetTable: "GoogleDriveAuth",
      targetId: state,
    });

    return NextResponse.redirect(new URL("/?drive=connected", req.url));
  } catch (error) {
    console.error("GDrive callback error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_failed", req.url));
  }
}
