export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

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
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const action = String(formData.get("wl_action"));
        const userId = "u_user1"; // dev stub
        const origin = process.env.NEXT_PUBLIC_API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
        const url = new URL(`/api/events/${eventId}/waitlist`, origin);
        if (action === "join") {
          await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
        } else if (action === "leave") {
          await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
        }
      }}
      className="mt-4 grid gap-2 rounded-md border p-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Лист ожидания</div>
          <div className="text-sm text-muted-foreground">В очереди: {initialCount}</div>
        </div>
        <div className="flex gap-2">
          <button name="wl_action" value="join" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Встать в очередь</button>
          <button name="wl_action" value="leave" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Выйти</button>
        </div>
      </div>
    </form>
  );
}


