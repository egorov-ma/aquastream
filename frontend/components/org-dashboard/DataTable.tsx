"use client";
import * as React from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";

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
        <Thead>
          <Tr>
            <Th>Событие</Th>
            <Th>Дата</Th>
            <Th>Цена</Th>
            <Th>Вместимость</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td>{r.title}</Td>
              <Td>{new Date(r.date).toLocaleDateString()}</Td>
              <Td>{r.price}</Td>
              <Td>{r.capacity}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}


