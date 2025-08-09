export const revalidate = 60;
import { getOrganizerCached } from "@/shared/data";

export default async function OrganizerHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await getOrganizerCached(orgSlug);
  return (
    <section data-test-id="page-org-home">
      <h1 className="text-xl font-semibold">Организатор: {org.name}</h1>
      <p className="mt-2 text-muted-foreground">{org.description ?? "Главная организатора"}</p>
    </section>
  );
}


