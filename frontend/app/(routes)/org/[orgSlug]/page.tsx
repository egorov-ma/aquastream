export const revalidate = 60;
export const metadata = { title: "Организатор" };

import { EventCard } from "@/components/org/EventCard";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import type { EventRow } from "@/components/org/EventsDataTable";
import { getOrganizerCached, getOrganizerEventsCached } from "@/shared/data";

export default async function OrganizerHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await getOrganizerCached(orgSlug);
  const list = (await getOrganizerEventsCached(orgSlug)) as unknown as EventRow[];
  const top2 = list.slice(0, 2);

  return (
    <Section data-test-id="page-org" gap="md">
      <PageHeader>
        <PageHeaderHeading>{org.name}</PageHeaderHeading>
        <PageHeaderDescription>
          {org.description ?? "Главная страница организатора"}
        </PageHeaderDescription>
      </PageHeader>
      {top2.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {top2.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              dateStart={event.dateStart}
              dateEnd={event.dateEnd ?? null}
              location={event.location ?? null}
              capacity={event.capacity ?? null}
              available={event.available ?? null}
              difficulty={event.difficulty ?? null}
              features={event.features ?? []}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
