"use client";
import * as React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = { id: string; title: string; date: string; price: number; capacity: number; };

export function DataTable() {
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/organizer/events", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: Row[] };
      setRows(data.items);
    })();
  }, []);

  return (
    <div className="rounded-md border">
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
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.title}</TableCell>
              <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
              <TableCell>{r.price}</TableCell>
              <TableCell>{r.capacity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


