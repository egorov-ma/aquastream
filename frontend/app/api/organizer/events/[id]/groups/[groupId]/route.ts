import { NextRequest, NextResponse } from "next/server";
import { deleteGroup, getGroup, updateGroup } from "@/shared/crews-store";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const { id, groupId } = await ctx.params;
  const g = getGroup(id, groupId);
  if (!g) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(g);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const { id, groupId } = await ctx.params;
  const patch = await req.json();
  const g = updateGroup(id, groupId, patch);
  if (!g) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(g);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const { id, groupId } = await ctx.params;
  const ok = deleteGroup(id, groupId);
  return NextResponse.json({ ok });
}


