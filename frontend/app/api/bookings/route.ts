import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { eventId } = await request.json();
  const id = `bk_${Math.random().toString(36).slice(2, 8)}`;
  return NextResponse.json({ id, eventId, status: "pending" });
}


