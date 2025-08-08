export default async function OrganizerEventsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <section data-test-id="page-org-events">
      <h1 className="text-xl font-semibold">События: {orgSlug}</h1>
      <p className="mt-2 text-muted-foreground">Список и фильтры (заглушка)</p>
    </section>
  );
}


