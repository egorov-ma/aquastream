import { OrganizerCard, type Organizer } from "./OrganizerCard";

export function OrganizerGrid({ items }: { items: Organizer[] }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-test-id="org-grid"
    >
      {items.map((o) => (
        <OrganizerCard key={o.id} organizer={o} />
      ))}
    </div>
  );
}


