export const revalidate = 60;
export const metadata = { title: "Организатор" };
import { getOrganizerCached, getOrganizerEventsCached } from "@/shared/data";
import { EventCard } from "@/components/org/EventCard";
import type { EventRow } from "@/components/org/EventsDataTable";

export default async function OrganizerHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await getOrganizerCached(orgSlug);
  // Подтягиваем ближайшие события (первые 2) через кэш‑хелпер
  const list: EventRow[] = await getOrganizerEventsCached(orgSlug) as unknown as EventRow[];
  const top2 = list.slice(0, 2);
  return (
    <section data-test-id="page-org" className="space-y-4">
      <h1 className="text-xl font-semibold">Организатор: {org.name}</h1>
      <p className="mt-2 text-muted-foreground">{org.description ?? "Главная организатора"}</p>
      {top2.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {top2.map((e) => (
            <EventCard
              key={e.id}
              id={e.id}
              title={e.title}
              dateStart={e.dateStart}
              dateEnd={e.dateEnd ?? null}
              location={e.location ?? null}
              capacity={e.capacity ?? null}
              available={e.available ?? null}
              difficulty={e.difficulty ?? null}
              features={e.features ?? []}
            />
          ))}
        </div>
      )}
    </section>
  );
}


