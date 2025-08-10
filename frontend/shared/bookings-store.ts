export type BookingStatus = "pending" | "submitted" | "paid" | "canceled";

export type Booking = {
  id: string;
  event: { id: string; title: string };
  amount: number;
  status: BookingStatus;
  proofUrl?: string;
};

// In-memory dev store. Lives per server process, good enough for mocks.
const idToBooking = new Map<string, Booking>();

export function createBooking(eventId: string): Booking {
  const id = `bk_${Math.random().toString(36).slice(2, 8)}`;
  const booking: Booking = {
    id,
    event: { id: eventId, title: "Оплата события" },
    amount: 2000,
    status: "pending",
  };
  idToBooking.set(id, booking);
  return booking;
}

export function getBooking(id: string): Booking | null {
  return idToBooking.get(id) ?? null;
}

export function setBookingStatus(id: string, status: BookingStatus): Booking | null {
  const existing = idToBooking.get(id);
  if (!existing) return null;
  const updated: Booking = { ...existing, status };
  idToBooking.set(id, updated);
  return updated;
}

export function submitQrProof(id: string, proofUrl: string): Booking | null {
  const existing = idToBooking.get(id);
  if (!existing) return null;
  const updated: Booking = { ...existing, status: "submitted", proofUrl };
  idToBooking.set(id, updated);
  return updated;
}

export function listSubmittedBookings(): Booking[] {
  return Array.from(idToBooking.values()).filter((b) => b.status === "submitted");
}

// Dev-only seed to have moderation queue placeholders
export function ensureDevSeedForQueue() {
  if (listSubmittedBookings().length > 0) return;
  const demo1: Booking = {
    id: "bk_demo1",
    event: { id: "ev_demo", title: "Событие A" },
    amount: 1500,
    status: "submitted",
    proofUrl: "/uploads/qr_demo1.png",
  };
  const demo2: Booking = {
    id: "bk_demo2",
    event: { id: "ev_demo", title: "Событие B" },
    amount: 2300,
    status: "submitted",
    proofUrl: "/uploads/qr_demo2.png",
  };
  idToBooking.set(demo1.id, demo1);
  idToBooking.set(demo2.id, demo2);
}


