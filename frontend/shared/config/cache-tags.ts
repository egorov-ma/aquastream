export const CACHE_TAGS = {
  organizers: "organizers",
  organizerBySlug: (slug: string) => `organizer:${slug}`,
  eventsByOrganizer: (slug: string) => `events:${slug}`,
  eventById: (id: string) => `event:${id}`,
} as const;


