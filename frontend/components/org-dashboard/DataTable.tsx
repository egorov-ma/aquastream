"use client";

import * as React from "react";
import Link from "next/link";

import { DataTableShell } from "@/components/ui/data-table-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

type Row = { id: string; title: string; date: string; price: number; capacity: number };

export function DataTable() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/organizer/events", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Не удалось загрузить список событий");
      }
      const data = (await res.json()) as { items: Row[] };
      setRows(data.items ?? []);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error(err);
      }
      setRows([]);
      setError("Не удалось загрузить список событий");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <DataTableShell title="События" description="Последние события и базовые метрики">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Событие</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead>Вместимость</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableEmpty colSpan={4} className="bg-background/40">
              <LoadingState />
            </TableEmpty>
          ) : error ? (
            <TableEmpty colSpan={4}>
              <ErrorState message={error} onRetry={load} />
            </TableEmpty>
          ) : rows.length === 0 ? (
            <TableEmpty colSpan={4}>
              <EmptyState title="Пока нет событий" />
            </TableEmpty>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="flex items-center gap-2">
                  <span>{r.title}</span>
                  <Link
                    href={`/org/dashboard/groups?eventId=${encodeURIComponent(r.id)}`}
                    className="text-xs text-muted-foreground underline"
                  >
                    Группы
                  </Link>
                </TableCell>
                <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                <TableCell>{r.price}</TableCell>
                <TableCell>{r.capacity}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
