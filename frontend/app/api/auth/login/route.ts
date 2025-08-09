import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username } = await request.json();
  const res = NextResponse.json({ ok: true, user: { username } });
  res.headers.append(
    "Set-Cookie",
    `sid=dev-${encodeURIComponent(username)}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return res;
}


