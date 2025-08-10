import { NextRequest, NextResponse } from "next/server";
import { getBooking } from "@/shared/bookings-store";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const booking = getBooking(id);
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(booking);
}


