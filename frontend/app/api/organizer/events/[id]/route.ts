import { NextRequest, NextResponse } from "next/server";
import { deleteEvent, getEvent, publishEvent, updateEvent } from "@/shared/organizer-events-store";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/shared/config/cache-tags";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const evt = getEvent(id);
  if (!evt) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(evt);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = await req.json();
  const evt = updateEvent(id, patch);
  if (!evt) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (patch.organizerSlug) revalidateTag(CACHE_TAGS.eventsByOrganizer(patch.organizerSlug));
  return NextResponse.json(evt);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ok = deleteEvent(id);
  // Не знаем slug — в реальном API у нас бы был organizerId; оставляем без revalidate
  return NextResponse.json({ ok });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // special action: publish
  const { action } = await req.json();
  const { id } = await ctx.params;
  if (action === "publish") {
    const evt = publishEvent(id);
    if (!evt) return NextResponse.json({ error: "not_found" }, { status: 404 });
    // При публикации желательно также инвалидировать список событий организатора
    // Здесь slug неизвестен — пропускаем
    return NextResponse.json(evt);
  }
  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}


