import { NextRequest, NextResponse } from "next/server";
import { freeSeat } from "@/shared/waitlist-store";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = freeSeat(id);
  return NextResponse.json({ ok: true, notifiedUserId: res.notifiedUserId });
}


