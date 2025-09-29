export const revalidate = 60;
export const metadata = { title: "События организатора" };

import { OrgEventsTable, type OrgEventRow } from "@/components/org/OrgEventsTable";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { getOrganizerEventsCached } from "@/shared/data";

async function fetchEvents(slug: string): Promise<OrgEventRow[]> {
  const items = await getOrganizerEventsCached(slug);
  return items as OrgEventRow[];
}

export default async function OrganizerEventsPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const { orgSlug } = params;
  const items = await fetchEvents(orgSlug);

  return (
    <Section data-test-id="page-org-events" gap="md">
      <PageHeader>
        <PageHeaderHeading>События организатора</PageHeaderHeading>
        <PageHeaderDescription>Всего событий: {items.length}</PageHeaderDescription>
      </PageHeader>
      <OrgEventsTable rows={items} />
    </Section>
  );
}
