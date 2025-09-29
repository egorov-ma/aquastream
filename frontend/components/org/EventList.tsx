"use client";

import { useEffect, useMemo, useState } from "react";
// no direct links/buttons here; rendered inside EventCard
import { EventCard } from "@/components/org/EventCard";
import { EventFilters, useEventFilters } from "@/components/org/EventFilters";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/states";

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
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters, resetFilters] = useEventFilters();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Загружаем один раз список событий; фильтруем на клиенте (серверная фильтрация вне объёма T09)
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = base
      ? `${base.replace(/\/$/, "")}/organizers/${slug}/events`
      : `/organizers/${slug}/events`;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
        const json: { items: Item[] } = await res.json();
        if (isMounted) {
          setItems(json.items);
          setError(null);
        }
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to fetch organizer events", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
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
    const filtered = items.filter((it) => byText(it) && byPrice(it) && byCap(it) && byDate(it));
    return filtered;
  }, [items, filters]);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const pageItems = visibleItems.slice((page - 1) * pageSize, page * pageSize);

  if (error) return (
    <div className="space-y-3">
      <EventFilters value={filters} onChange={setFilters} onReset={resetFilters} />
      <ErrorState
        message="Не удалось загрузить события организатора"
        description={error}
      />
    </div>
  );

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
          {pageItems.length === 0 ? (
        <li className="text-sm text-muted-foreground">Нет событий по выбранным фильтрам</li>
          ) : pageItems.map((e) => (
            <li key={e.id}>
              <EventCard
                id={e.id}
                title={e.title}
                dateStart={e.dateStart}
                location={undefined}
                capacity={e.capacity ?? null}
                available={e.available ?? null}
                difficulty={null}
                features={[]}
              />
            </li>
          ))}
      </ul>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (canPrev) setPage((p) => p - 1); }} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              {page}
            </PaginationLink>
          </PaginationItem>
          {page + 1 <= totalPages && (
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(page + 1); }}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          {page + 2 < totalPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (canNext) setPage((p) => p + 1); }} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
