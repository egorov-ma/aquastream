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
      <WaitlistSection eventId={eventId} initialCount={(wait.items as { userId: string; joinedAt: number }[]).length} />
      <form action={async () => { 'use server'; const { createBookingAndGo } = await import('./actions'); await createBookingAndGo(eventId); }}>
        <button type="submit" className="mt-4 h-10 rounded-md border px-4 text-sm hover:bg-muted/50">
          Записаться
        </button>
      </form>
    </section>
  );
}

function WaitlistSection({ eventId, initialCount }: { eventId: string; initialCount: number }) {
  const Toggle = async (_: FormData) => {
    "use server";
    const origin = process.env.NEXT_PUBLIC_API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
    const url = new URL(`/api/events/${eventId}/waitlist`, origin);
    const userId = "u_user1";
    // простая проверка текущего статуса
    const cur = await fetch(url, { cache: "no-store" }).then(r => r.json()).catch(() => ({ joined: false }));
    if (!cur.joined) {
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    } else {
      await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    }
  };
  return (
    <form action={Toggle} className="mt-4 grid gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Лист ожидания</div>
          <div className="text-sm text-muted-foreground">В очереди: {initialCount}</div>
        </div>
        <button className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Переключить</button>
      </div>
    </form>
  );
}


