export type OrganizerEventStatus = "draft" | "preview" | "published";

export type OrganizerEvent = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  location?: string | null;
  price?: number | null;
  capacity?: number | null;
  description?: string | null;
  status: OrganizerEventStatus;
};

const events = new Map<string, OrganizerEvent>();

export function listEvents(): OrganizerEvent[] {
  return Array.from(events.values()).sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}

export function getEvent(id: string): OrganizerEvent | null {
  return events.get(id) ?? null;
}

export function createEvent(data: Omit<OrganizerEvent, "id" | "status"> & Partial<Pick<OrganizerEvent, "status">>): OrganizerEvent {
  const id = `ev_${Math.random().toString(36).slice(2, 8)}`;
  const evt: OrganizerEvent = {
    id,
    title: data.title,
    dateStart: data.dateStart,
    dateEnd: data.dateEnd ?? null,
    location: data.location ?? null,
    price: data.price ?? null,
    capacity: data.capacity ?? null,
    description: data.description ?? null,
    status: data.status ?? "draft",
  };
  events.set(id, evt);
  return evt;
}

export function updateEvent(id: string, patch: Partial<OrganizerEvent>): OrganizerEvent | null {
  const current = events.get(id);
  if (!current) return null;
  const updated: OrganizerEvent = { ...current, ...patch };
  events.set(id, updated);
  return updated;
}

export function deleteEvent(id: string): boolean {
  return events.delete(id);
}

export function publishEvent(id: string): OrganizerEvent | null {
  const current = events.get(id);
  if (!current) return null;
  // примитивная проверка обязательных полей
  if (!current.title || !current.dateStart || current.price == null || current.capacity == null) {
    return current; // остаётся как есть
  }
  const updated: OrganizerEvent = { ...current, status: "published" };
  events.set(id, updated);
  return updated;
}


