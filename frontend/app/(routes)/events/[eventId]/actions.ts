"use server";

import { redirect } from "next/navigation";
import { resolveApiOrigin } from "@/lib/server/resolve-api-origin";

export async function createBookingAndGo(eventId: string) {
  const origin = await resolveApiOrigin();
  const res = await fetch(`${origin}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId }),
  });
  if (!res.ok) return;
  const { id } = await res.json();
  redirect(`/checkout/${id}`);
}
