import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAllowed } from "@/shared/rbac";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const protectedRoutes = ["/dashboard", "/org/dashboard"];
  if (protectedRoutes.some((r) => pathname.startsWith(r))) {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const role = (req.cookies.get("role")?.value as any) ?? null;
    if (!isAllowed(pathname, role as any)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/org/dashboard"],
};


