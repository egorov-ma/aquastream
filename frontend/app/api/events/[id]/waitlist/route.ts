import { NextRequest, NextResponse } from "next/server";
import { isInWaitlist, joinWaitlist, leaveWaitlist, listWaitlist } from "@/shared/waitlist-store";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return NextResponse.json({ items: listWaitlist(id) });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { userId } = (await req.json()) as { userId: string };
  const res = joinWaitlist(id, userId);
  return NextResponse.json({ ok: res.ok, already: res.already ?? false, inWaitlist: isInWaitlist(id, userId) });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { userId } = (await req.json()) as { userId: string };
  const res = leaveWaitlist(id, userId);
  return NextResponse.json({ ok: res.ok, inWaitlist: isInWaitlist(id, userId) });
}


