import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/shared/config/cache-tags";
import { serverFetch } from "@/shared/http";

const withBase = (path: string) => path; // serverFetch сам решает origin

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
    const res = await serverFetch<OrganizerDto>(withBase(`/organizers/${slug}`), { timeoutMs: 10_000, next: { revalidate: 60, tags: [CACHE_TAGS.organizerBySlug(slug)] } as any });
    if (res.ok) return res.data;
    // Graceful fallback на Abort в dev
    const fallback: OrganizerDto = { id: `org-${slug}`, slug, name: slug };
    return fallback;
  },
  ["organizer"],
);

export const getOrganizerEventsCached = unstable_cache(
  async (slug: string): Promise<EventDto[]> => {
    const res = await serverFetch<{ items: EventDto[] }>(withBase(`/organizers/${slug}/events`), { timeoutMs: 10_000, next: { revalidate: 60, tags: [CACHE_TAGS.eventsByOrganizer(slug)] } as any });
    if (res.ok) return res.data.items;
    return [];
  },
  ["organizer-events"],
);


