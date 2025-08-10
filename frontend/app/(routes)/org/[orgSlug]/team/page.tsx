export const revalidate = 60;
export const metadata = { title: "Команда организатора" };
import { TeamList } from "@/components/org/TeamList";

export default async function OrganizerTeamPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <section data-test-id="page-org-team">
      <TeamList slug={orgSlug} />
    </section>
  );
}


