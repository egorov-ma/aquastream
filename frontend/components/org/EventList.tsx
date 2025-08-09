"use client";

import { useEffect, useMemo, useState } from "react";
import { EventFilters, useEventFilters } from "@/components/org/EventFilters";

type Item = {
  id: string;
  title: string;
  dateStart: string;
  price?: number;
  capacity?: number;
  available?: number;
};

export function EventList({ slug }: { slug: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters, resetFilters] = useEventFilters();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const sp = new URLSearchParams();
    if (filters.q) sp.set("q", filters.q);
    if (filters.minPrice != null) sp.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice != null) sp.set("maxPrice", String(filters.maxPrice));
    if (filters.minCap != null) sp.set("minCap", String(filters.minCap));
    if (filters.maxCap != null) sp.set("maxCap", String(filters.maxCap));
    if (filters.from) sp.set("from", filters.from);
    if (filters.to) sp.set("to", filters.to);
    const qs = sp.toString();
    const baseUrl = base ? `${base.replace(/\/$/, "")}/organizers/${slug}/events` : `/organizers/${slug}/events`;
    const url = qs ? `${baseUrl}?${qs}` : baseUrl;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: { items: Item[] }) => setItems(json.items))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug, filters.q, filters.minPrice, filters.maxPrice, filters.minCap, filters.maxCap, filters.from, filters.to]);

  if (loading) return (
    <div className="space-y-3">
      <EventFilters value={filters} onChange={setFilters} onReset={resetFilters} />
      <p>Загрузка…</p>
    </div>
  );

  if (!items.length) return (
    <div className="space-y-3">
      <EventFilters value={filters} onChange={setFilters} onReset={resetFilters} />
      <p>Событий пока нет</p>
    </div>
  );

  return (
    <div className="space-y-3" data-test-id="org-events">
      <EventFilters value={filters} onChange={setFilters} onReset={resetFilters} />
      <ul className="space-y-3">
      {items.map((e) => (
        <li key={e.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(e.dateStart).toLocaleString()}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {typeof e.price === "number" && <div>₽ {e.price}</div>}
              {typeof e.capacity === "number" && (
                <div>
                  Места: {e.available ?? 0}/{e.capacity}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
      </ul>
    </div>
  );
}


