import { NextRequest, NextResponse } from "next/server";
import { deleteFaqItem, updateFaqItem } from "@/shared/organizer-profile-store";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = await req.json();
  const updated = updateFaqItem(id, patch);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ok = deleteFaqItem(id);
  return NextResponse.json({ ok });
}


