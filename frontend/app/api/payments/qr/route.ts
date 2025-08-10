import { NextResponse } from "next/server";
import { submitQrProof } from "@/shared/bookings-store";

export async function POST(request: Request) {
  // эмуляция загрузки: принимаем JSON { bookingId, fileName, fileSize }
  const { bookingId, fileName } = (await request.json()) as { bookingId: string; fileName: string };
  const proofUrl = `/uploads/${encodeURIComponent(fileName)}`;
  const updated = submitQrProof(bookingId, proofUrl);
  if (!updated) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, booking: updated });
}


