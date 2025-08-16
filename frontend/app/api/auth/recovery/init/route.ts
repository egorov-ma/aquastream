import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.json();
  // Возвращаем временный token для шага verify
  return NextResponse.json({ token: "mock-token-123" });
}


