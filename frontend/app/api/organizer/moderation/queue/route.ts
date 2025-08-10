import { NextRequest, NextResponse } from "next/server";
import { getBooking, setBookingStatus, listSubmittedBookings, ensureDevSeedForQueue } from "@/shared/bookings-store";

// MVP: очередь формируем по переданным id (?ids=bk_1,bk_2), отбирая только submitted
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const csv = url.searchParams.get("ids");
  const ids = (csv ? csv.split(",") : []).filter(Boolean);
  let items: Array<{ id: string; amount: number; proofUrl?: string; status: string; eventId: string }> = [];
  if (ids.length > 0) {
    items = ids
      .map((id) => getBooking(id))
      .filter((b): b is NonNullable<ReturnType<typeof getBooking>> => Boolean(b))
      .filter((b) => b.status === "submitted")
      .map((b) => ({ id: b.id, amount: b.amount, proofUrl: b.proofUrl, status: b.status, eventId: b.event.id }));
  } else {
    // заглушки
    ensureDevSeedForQueue();
    items = listSubmittedBookings().map((b) => ({ id: b.id, amount: b.amount, proofUrl: b.proofUrl, status: b.status, eventId: b.event.id }));
  }
  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, action, comment } = body as { id: string; action: "accept" | "reject"; comment?: string };
  const booking = getBooking(id);
  if (!booking) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const status = action === "accept" ? "paid" : "canceled";
  const updated = setBookingStatus(id, status);
  return NextResponse.json({ ok: true, booking: updated, comment: comment ?? null });
}


