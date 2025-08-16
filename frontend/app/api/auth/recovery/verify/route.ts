import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.json();
  // Успешная верификация кода/резервного кода
  return NextResponse.json({ ok: true });
}


