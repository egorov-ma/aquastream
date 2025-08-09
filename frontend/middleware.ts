import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isUserDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOrgDashboard = req.nextUrl.pathname.startsWith("/org/dashboard");

  if (isUserDashboard || isOrgDashboard) {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
    if (isOrgDashboard) {
      const role = req.cookies.get("role")?.value;
      if (role !== "organizer" && role !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/org/dashboard"],
};


