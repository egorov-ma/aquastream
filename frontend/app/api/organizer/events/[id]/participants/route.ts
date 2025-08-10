import { NextRequest, NextResponse } from "next/server";
import { listParticipants } from "@/shared/crews-store";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const items = listParticipants(id);
  return NextResponse.json({ items });
}


