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
  const total = rows.length;
  const fmt = new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <Table>
      <TableCaption>Список событий организатора.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[220px]">Событие</TableHead>
          <TableHead>Период</TableHead>
          <TableHead>Локация</TableHead>
          <TableHead className="text-right">Цена</TableHead>
          <TableHead className="text-right">Места</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((ev) => {
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
  );
}


