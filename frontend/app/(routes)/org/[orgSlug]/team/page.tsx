export const revalidate = 60;
export const metadata = { title: "Команда организатора" };

import { TeamList } from "@/components/org/TeamList";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export default async function OrganizerTeamPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <Section data-test-id="page-org-team" gap="md">
      <PageHeader>
        <PageHeaderHeading>Команда организатора</PageHeaderHeading>
        <PageHeaderDescription>Список участников команды и их роли.</PageHeaderDescription>
      </PageHeader>
      <TeamList slug={orgSlug} />
    </Section>
  );
}
