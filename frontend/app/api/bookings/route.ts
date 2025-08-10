import { NextResponse } from "next/server";
import { createBooking } from "@/shared/bookings-store";

export async function POST(request: Request) {
  const { eventId } = await request.json();
  const booking = createBooking(eventId);
  return NextResponse.json({ id: booking.id, status: booking.status });
}


