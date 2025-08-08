export const revalidate = 60;
export default async function OrganizerTeamPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <section data-test-id="page-org-team">
      <h1 className="text-xl font-semibold">Команда: {orgSlug}</h1>
      <p className="mt-2 text-muted-foreground">Список команды (заглушка)</p>
    </section>
  );
}


