import { NextRequest, NextResponse } from "next/server";
import { createGroup, listGroups, summarizeByType, GroupType } from "@/shared/crews-store";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as GroupType | null;
  const summary = searchParams.get("summary");
  if (summary) {
    return NextResponse.json(summarizeByType(id));
  }
  const items = listGroups(id, type ?? undefined);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const created = createGroup(id, { type: body.type, name: body.name, capacity: Number(body.capacity ?? 0) });
  return NextResponse.json(created, { status: 201 });
}


