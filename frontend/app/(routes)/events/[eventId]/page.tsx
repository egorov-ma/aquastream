export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';
export const metadata = { title: 'Событие' };

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  // summary по группам
  const origin = process.env.NEXT_PUBLIC_API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  const [summaryRes, waitRes] = await Promise.all([
    fetch(new URL(`/api/organizer/events/${eventId}/groups?summary=1`, origin), { cache: "no-store" }).catch(() => null),
    fetch(new URL(`/api/events/${eventId}/waitlist`, origin), { cache: "no-store" }).catch(() => null),
  ]);
  const summary = summaryRes && summaryRes.ok ? await summaryRes.json() : null;
  const wait = waitRes && waitRes.ok ? await waitRes.json() : { items: [] };
  const joined = Array.isArray(wait.items) ? (wait.items as { userId: string }[]).some((i) => i.userId === "u_user1") : false;
  return (
    <section data-test-id="page-event">
      <h1 className="text-xl font-semibold">Событие #{eventId}</h1>
      <p className="mt-2 text-muted-foreground">Карточка события (заглушка)</p>
      {summary && (
        <div className="mt-4 grid gap-2 rounded-md border p-3 text-sm">
          <div className="font-medium">Группы</div>
          <div className="text-muted-foreground">Экипажи: {summary.crew.used}/{summary.crew.capacity} (групп: {summary.crew.groups})</div>
          <div className="text-muted-foreground">Лодки: {summary.boat.used}/{summary.boat.capacity} (групп: {summary.boat.groups})</div>
          <div className="text-muted-foreground">Палатки: {summary.tent.used}/{summary.tent.capacity} (групп: {summary.tent.groups})</div>
        </div>
      )}
      <ClientWaitlistSection eventId={eventId} initialCount={(wait.items as { userId: string; joinedAt: number }[]).length} initialJoined={joined} />
      <form action={async () => { 'use server'; const { createBookingAndGo } = await import('./actions'); await createBookingAndGo(eventId); }}>
        <button type="submit" className="mt-4 h-10 rounded-md border px-4 text-sm hover:bg-muted/50">
          Записаться
        </button>
      </form>
    </section>
  );
}

import { WaitlistSection as ClientWaitlistSection } from "@/components/events/WaitlistSection";


