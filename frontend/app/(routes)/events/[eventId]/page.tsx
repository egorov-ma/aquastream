export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return (
    <section data-test-id="page-event">
      <h1 className="text-xl font-semibold">Событие #{eventId}</h1>
      <p className="mt-2 text-muted-foreground">Карточка события (заглушка)</p>
      <form action={async () => { 'use server'; const { createBookingAndGo } = await import('./actions'); await createBookingAndGo(eventId); }}>
        <button type="submit" className="mt-4 h-10 rounded-md border px-4 text-sm hover:bg-muted/50">
          Записаться
        </button>
      </form>
    </section>
  );
}


