export const revalidate = 60;
export default async function OrganizerFaqPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <section data-test-id="page-org-faq">
      <h1 className="text-xl font-semibold">FAQ: {orgSlug}</h1>
      <p className="mt-2 text-muted-foreground">Вопросы и ответы (заглушка)</p>
    </section>
  );
}


