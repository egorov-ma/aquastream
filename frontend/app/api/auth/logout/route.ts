import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  // Сбрасываем sid и role
  res.headers.append("Set-Cookie", `sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  res.headers.append("Set-Cookie", `role=; Path=/; SameSite=Lax; Max-Age=0${secure}`);
  return res;
}


