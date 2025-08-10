import { NextRequest, NextResponse } from "next/server";
import { assignMember } from "@/shared/crews-store";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const { id, groupId } = await ctx.params;
  const { participantId } = await req.json();
  const res = assignMember(id, groupId, participantId);
  if (!res.ok) {
    const status = res.reason === "capacity_exceeded" ? 409 : 404;
    return NextResponse.json({ ok: false, reason: res.reason }, { status });
  }
  return NextResponse.json({ ok: true, group: res.group });
}


