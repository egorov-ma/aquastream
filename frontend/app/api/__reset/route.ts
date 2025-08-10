import { NextResponse } from "next/server";
import { __reset as resetWaitlist } from "@/shared/waitlist-store";
import { ensureDevSeedForQueue } from "@/shared/bookings-store";

export async function POST() {
  resetWaitlist();
  ensureDevSeedForQueue();
  return NextResponse.json({ ok: true });
}


