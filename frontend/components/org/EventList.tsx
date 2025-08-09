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

  // Загружаем один раз список событий; фильтруем на клиенте (серверная фильтрация вне объёма T09)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = base
      ? `${base.replace(/\/$/, "")}/organizers/${slug}/events`
      : `/organizers/${slug}/events`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: { items: Item[] }) => setItems(json.items))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug]);

  const visibleItems = useMemo(() => {
    const byText = (it: Item) =>
      !filters.q || it.title.toLowerCase().includes(filters.q.toLowerCase());
    const byPrice = (it: Item) => {
      const p = it.price ?? 0;
      if (filters.minPrice != null && p < filters.minPrice) return false;
      if (filters.maxPrice != null && p > filters.maxPrice) return false;
      return true;
    };
    const byCap = (it: Item) => {
      const c = it.capacity ?? 0;
      if (filters.minCap != null && c < filters.minCap) return false;
      if (filters.maxCap != null && c > filters.maxCap) return false;
      return true;
    };
    const byDate = (it: Item) => {
      const d = new Date(it.dateStart);
      if (filters.from && d < new Date(filters.from)) return false;
      if (filters.to) {
        const to = new Date(filters.to);
        // включительно до конца дня
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
      return true;
    };
    return items.filter((it) => byText(it) && byPrice(it) && byCap(it) && byDate(it));
  }, [items, filters]);

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
      {visibleItems.length === 0 ? (
        <li className="text-sm text-muted-foreground">Нет событий по выбранным фильтрам</li>
      ) : visibleItems.map((e) => (
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


