export const revalidate = 60;
import { OrgEventsTable, type OrgEventRow } from "@/components/org/OrgEventsTable";
import { getOrganizerEventsCached } from "@/shared/data";

async function fetchEvents(slug: string): Promise<OrgEventRow[]> {
  const items = await getOrganizerEventsCached(slug);
  return items as OrgEventRow[];
}

export default async function OrganizerEventsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const items = await fetchEvents(orgSlug);
  return (
    <section data-test-id="page-org-events" className="space-y-3">
      <OrgEventsTable rows={items} />
    </section>
  );
}


