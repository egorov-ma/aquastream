import { WaitlistSection as ClientWaitlistSection } from "@/components/events/WaitlistSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveApiOrigin } from "@/lib/server/resolve-api-origin";

export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';
export const metadata = { title: 'Событие' };

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  const origin = resolveApiOrigin();
  const [summaryRes, waitRes] = await Promise.all([
    fetch(`${origin}/api/organizer/events/${eventId}/groups?summary=1`, { cache: "no-store" }).catch(() => null),
    fetch(`${origin}/api/events/${eventId}/waitlist`, { cache: "no-store" }).catch(() => null),
  ]);
  const summary = summaryRes && summaryRes.ok ? await summaryRes.json() : null;
  const wait = waitRes && waitRes.ok ? await waitRes.json() : { items: [] };
  const joined = Array.isArray(wait.items) ? (wait.items as { userId: string }[]).some((i) => i.userId === "u_user1") : false;
  return (
    <section data-test-id="page-event">
      <h1 className="text-xl font-semibold">Событие #{eventId}</h1>
      <p className="mt-2 text-muted-foreground">Карточка события (заглушка)</p>
      {summary && (
        <Card className="mt-4">
          <CardContent className="grid gap-2 text-sm pt-0">
            <div className="font-medium">Группы</div>
            <div className="text-muted-foreground">Экипажи: {summary.crew.used}/{summary.crew.capacity} (групп: {summary.crew.groups})</div>
            <div className="text-muted-foreground">Лодки: {summary.boat.used}/{summary.boat.capacity} (групп: {summary.boat.groups})</div>
            <div className="text-muted-foreground">Палатки: {summary.tent.used}/{summary.tent.capacity} (групп: {summary.tent.groups})</div>
          </CardContent>
        </Card>
      )}
      <ClientWaitlistSection eventId={eventId} initialCount={(wait.items as { userId: string; joinedAt: number }[]).length} initialJoined={joined} />
      <form action={async () => { 'use server'; const { createBookingAndGo } = await import('./actions'); await createBookingAndGo(eventId); }}>
        <Button type="submit" className="mt-4">Записаться</Button>
      </form>
    </section>
  );
}
