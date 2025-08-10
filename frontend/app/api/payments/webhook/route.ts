import { NextResponse } from "next/server";
import { setBookingStatus } from "@/shared/bookings-store";

export async function POST(request: Request) {
  const { bookingId, status } = (await request.json()) as { bookingId: string; status: "paid" | "canceled" };
  const updated = setBookingStatus(bookingId, status);
  if (!updated) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, booking: updated });
}


