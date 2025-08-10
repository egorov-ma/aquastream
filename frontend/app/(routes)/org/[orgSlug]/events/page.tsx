export const revalidate = 60;
import { OrgEventsTable, type OrgEventRow } from "@/components/org/OrgEventsTable";

async function fetchEvents(slug: string): Promise<OrgEventRow[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const r = await fetch(`${base.replace(/\/$/, "")}/organizers/${slug}/events`, { cache: "no-store" });
  const json = await r.json();
  return json.items as OrgEventRow[];
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


