import { NextResponse } from "next/server";
import { listUsers } from "@/shared/users-store";

export async function GET() {
  return NextResponse.json({ items: listUsers() });
}


