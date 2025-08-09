import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, role } = (await request.json()) as { username: string; role?: "user" | "organizer" | "admin" };
  const userRole = role ?? "user";
  const res = NextResponse.json({ ok: true, user: { username, role: userRole } });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.headers.append(
    "Set-Cookie",
    `sid=dev-${encodeURIComponent(username)}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
  res.headers.append(
    "Set-Cookie",
    `role=${encodeURIComponent(userRole)}; Path=/; SameSite=Lax${secure}`,
  );
  return res;
}


