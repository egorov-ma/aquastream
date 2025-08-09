"use server";

import { redirect } from "next/navigation";

export async function createBookingAndGo(eventId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId }),
  });
  if (!res.ok) return;
  const { id } = await res.json();
  redirect(`/checkout/${id}`);
}


