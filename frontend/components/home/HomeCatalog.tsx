"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { OrganizerGrid } from "@/components/organizers/OrganizerGrid";
// removed unused Button
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type ApiResponse = { items: { id: string; slug: string; name: string }[]; total: number };

export function HomeCatalog() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse>({ items: [], total: 0 });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    [data?.total]
  );

  useEffect(() => {
    // Ждём готовности MSW при включённых моках, чтобы первый запрос не ушёл в сеть
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
    if (useMocks && !window.__mswReady) {
      const onReady = () => fetchPage();
      window.addEventListener("msw-ready", onReady, { once: true });
      return () => window.removeEventListener("msw-ready", onReady);
    }
    fetchPage();
    function fetchPage() {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const params = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) });
    const endpoint = base
      ? `${base.replace(/\/$/, "")}/organizers?${params.toString()}`
      : `/organizers?${params.toString()}`;
    fetch(endpoint, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as ApiResponse;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
      return () => controller.abort();
    }
  }, [q, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>(
          "input[data-test-id='search-input']"
        );
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Каталог организаторов</h1>
        <div className="w-full max-w-sm">
          <Input
            placeholder="Поиск по имени... (нажмите /)"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            data-test-id="search-input"
          />
        </div>
      </div>

      {loading && <p data-test-id="state-loading">Загрузка…</p>}
      {error && !loading && (
        <p className="text-destructive" data-test-id="state-error">
          Ошибка: {error}
        </p>
      )}
      {!loading && !error && data.items.length === 0 && (
        <p data-test-id="state-empty">Ничего не найдено</p>
      )}

      {!loading && !error && data.items.length > 0 && (
        <OrganizerGrid items={data.items} />
      )}

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


