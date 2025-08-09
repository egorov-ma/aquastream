export const revalidate = 60;
import { EventList } from "@/components/org/EventList";

export default async function OrganizerEventsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <section data-test-id="page-org-events" className="space-y-3">
      <EventList slug={orgSlug} />
    </section>
  );
}


