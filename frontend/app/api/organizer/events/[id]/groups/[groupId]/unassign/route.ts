import { NextRequest, NextResponse } from "next/server";
import { unassignMember } from "@/shared/crews-store";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const { id, groupId } = await ctx.params;
  const { participantId } = await req.json();
  const res = unassignMember(id, groupId, participantId);
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, group: res.group });
}


