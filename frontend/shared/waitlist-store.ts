export type WaitlistEntry = {
  userId: string;
  joinedAt: number;
};

const waitlists = new Map<string, WaitlistEntry[]>(); // eventId -> queue

function ensure(eventId: string) {
  if (!waitlists.has(eventId)) waitlists.set(eventId, []);
}

export function listWaitlist(eventId: string): WaitlistEntry[] {
  ensure(eventId);
  return [...waitlists.get(eventId)!].sort((a, b) => a.joinedAt - b.joinedAt);
}

export function isInWaitlist(eventId: string, userId: string): boolean {
  return listWaitlist(eventId).some((e) => e.userId === userId);
}

export function joinWaitlist(eventId: string, userId: string): { ok: boolean; already?: boolean } {
  ensure(eventId);
  const list = waitlists.get(eventId)!;
  if (list.some((e) => e.userId === userId)) return { ok: true, already: true };
  list.push({ userId, joinedAt: Date.now() });
  return { ok: true };
}

export function leaveWaitlist(eventId: string, userId: string): { ok: boolean } {
  ensure(eventId);
  const list = waitlists.get(eventId)!;
  const next = list.filter((e) => e.userId !== userId);
  waitlists.set(eventId, next);
  return { ok: true };
}

export function freeSeat(eventId: string): { notifiedUserId: string | null } {
  ensure(eventId);
  const list = waitlists.get(eventId)!;
  if (list.length === 0) return { notifiedUserId: null };
  const [first, ...rest] = list;
  waitlists.set(eventId, rest);
  // emulate sending notification
  if (process.env.NODE_ENV !== "production") {
    console.log("[waitlist] notify user", first.userId, "for event", eventId);
  }
  return { notifiedUserId: first.userId };
}

// Test/dev only: reset all queues
export function __reset() {
  waitlists.clear();
}


