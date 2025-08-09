import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();
  // Имитируем политику сильного пароля и успешный сброс
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ ok: false, error: "weak_password" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}


