import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const _ = await request.json();
  // Возвращаем временный token для шага verify
  return NextResponse.json({ token: "mock-token-123" });
}


