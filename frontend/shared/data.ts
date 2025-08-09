import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/shared/config/cache-tags";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const withBase = (path: string) => {
  if (apiBase) return `${apiBase}${path}`;
  const port = process.env.PORT || "3000";
  return `http://localhost:${port}${path}`;
};

export type OrganizerDto = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  brandColor?: string;
};

export type EventDto = {
  id: string;
  title: string;
  dateStart: string;
  price?: number;
  capacity?: number;
  available?: number;
};

export const getOrganizerCached = unstable_cache(
  async (slug: string): Promise<OrganizerDto> => {
    const res = await fetch(withBase(`/organizers/${slug}`), {
      next: { revalidate: 60, tags: [CACHE_TAGS.organizerBySlug(slug)] },
    });
    return res.json();
  },
  ["organizer"],
);

export const getOrganizerEventsCached = unstable_cache(
  async (slug: string): Promise<EventDto[]> => {
    const res = await fetch(withBase(`/organizers/${slug}/events`), {
      next: { revalidate: 60, tags: [CACHE_TAGS.eventsByOrganizer(slug)] },
    });
    const json = (await res.json()) as { items: EventDto[] };
    return json.items;
  },
  ["organizer-events"],
);


