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
    </section>
  );
}


