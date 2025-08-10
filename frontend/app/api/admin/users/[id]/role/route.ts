import { NextRequest, NextResponse } from "next/server";
import { setUserRole } from "@/shared/users-store";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { role } = (await req.json()) as { role: "user" | "organizer" | "admin" };
  const updated = setUserRole(id, role);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(updated);
}


