"use client";

import * as React from "react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type OrgEventRow = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  location?: string | null;
  price?: number | null;
  capacity?: number | null;
  available?: number | null;
};

export function OrgEventsTable({ rows }: { rows: OrgEventRow[] }) {
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<null | { key: keyof OrgEventRow; dir: "asc" | "desc" }>(null);
  const fmt = new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const filtered = React.useMemo(() => {
    const base = rows.filter((r) =>
      (r.title?.toLowerCase() ?? "").includes(q.toLowerCase()) || (r.location?.toLowerCase() ?? "").includes(q.toLowerCase()),
    );
    if (!sort) return base;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, q, sort]);
  const total = filtered.length;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск..." className="h-11 rounded-md border px-3 text-base md:h-9 md:text-sm" />
      </div>
      <Table>
      <TableCaption>Список событий организатора.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[220px]">
            <button className="hover:underline" onClick={() => setSort((s) => ({ key: "title", dir: s?.key === "title" && s.dir === "asc" ? "desc" : "asc" }))}>Событие</button>
          </TableHead>
          <TableHead>Период</TableHead>
          <TableHead>
            <button className="hover:underline" onClick={() => setSort((s) => ({ key: "location", dir: s?.key === "location" && s.dir === "asc" ? "desc" : "asc" }))}>Локация</button>
          </TableHead>
          <TableHead className="text-right">
            <button className="hover:underline" onClick={() => setSort((s) => ({ key: "price", dir: s?.key === "price" && s.dir === "asc" ? "desc" : "asc" }))}>Цена</button>
          </TableHead>
          <TableHead className="text-right">Места</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((ev) => {
          const start = fmt.format(new Date(ev.dateStart));
          const end = ev.dateEnd ? fmt.format(new Date(ev.dateEnd)) : null;
          const price = ev.price ?? 0;
          const cap = ev.capacity ?? 0;
          const avail = ev.available ?? 0;
          const taken = Math.max(0, cap - avail);
          return (
            <TableRow key={ev.id}>
              <TableCell className="font-medium">
                <a href={`/events/${ev.id}`} className="hover:underline">{ev.title}</a>
              </TableCell>
              <TableCell>
                {start}
                {end ? (
                  <>
                    <span className="mx-1 text-destructive">—</span>
                    {end}
                  </>
                ) : null}
              </TableCell>
              <TableCell>{ev.location ?? "—"}</TableCell>
              <TableCell className="text-right">{price} ₽</TableCell>
              <TableCell className="text-right">{taken} / {cap}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Всего событий</TableCell>
          <TableCell className="text-right">{total}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    </div>
  );
}


