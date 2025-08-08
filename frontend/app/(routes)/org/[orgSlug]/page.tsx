export default async function OrganizerHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <section data-test-id="page-org-home">
      <h1 className="text-xl font-semibold">Организатор: {orgSlug}</h1>
      <p className="mt-2 text-muted-foreground">Главная организатора (заглушка)</p>
    </section>
  );
}


