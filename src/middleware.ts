import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, favicon, manifest, sw, icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = pathname === "/" || pathname === "/login";
  const isChangePasswordPage = pathname === "/account/change-password";
  const isChangePasswordApi = pathname === "/api/account/change-password";

  // If user is not logged in:
  if (!token) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    // Redirect to login
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  // If user is logged in and MUST change password:
  if (token.mustChangePassword) {
    if (isChangePasswordPage || isChangePasswordApi) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/account/change-password", req.url));
  }

  // If user is on login/root page and already authenticated with no pending password change:
  if (isAuthPage) {
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else if (token.role === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher/attendance", req.url));
    } else if (token.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
  }

  // Role-based route guards
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/teacher") && token.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/student") && token.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
