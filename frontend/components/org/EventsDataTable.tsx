"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from "@/components/ui/table";
import { ToolbarGroup, ToolbarSpacer } from "@/components/ui/toolbar";
import { EmptyState } from "@/components/ui/states";

export type EventRow = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  location?: string | null;
  price?: number | null;
  capacity?: number | null;
  available?: number | null;
  difficulty?: number | null;
  features?: string[];
};

export const eventColumns: ColumnDef<EventRow>[] = [
  { accessorKey: "title", header: "Событие" },
  {
    accessorKey: "dateStart",
    header: "Начало",
    cell: ({ row }) => new Date(row.getValue<string>("dateStart")).toLocaleString(),
  },
  {
    accessorKey: "dateEnd",
    header: "Окончание",
    cell: ({ row }) => {
      const val = row.getValue<string | null>("dateEnd");
      return val ? new Date(val).toLocaleString() : "—";
    },
  },
  { accessorKey: "location", header: "Локация", cell: ({ row }) => row.getValue("location") || "—" },
  { accessorKey: "price", header: "Цена", cell: ({ row }) => (row.getValue<number | null>("price") ?? 0) + " ₽" },
  {
    id: "places",
    header: "Места",
    cell: ({ row }) => {
      const cap = row.original.capacity ?? 0;
      const avail = row.original.available ?? 0;
      return `${cap - avail} / ${cap}`;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button asChild size="sm">
        <Link href={`/events/${row.original.id}`}>Открыть</Link>
      </Button>
    ),
  },
];

export function EventsDataTable({ rows }: { rows: EventRow[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: rows,
    columns: eventColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  return (
    <DataTableShell
      title="События"
      description="Работа с расписанием и местами"
      toolbar={(
        <>
          <ToolbarGroup className="w-full max-w-sm">
            <Input
              placeholder="Фильтр по названию"
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
            />
          </ToolbarGroup>
          <ToolbarSpacer />
          <ToolbarGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Колонки <ChevronDown className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarGroup>
        </>
      )}
      footer={(
        <>
          <span className="text-sm text-muted-foreground">
            Найдено: {table.getFilteredRowModel().rows.length}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Далее
            </Button>
          </div>
        </>
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : typeof header.column.columnDef.header === "function"
                      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (header.column.columnDef.header as (ctx: any) => React.ReactNode)({ column: header.column })
                      : (header.column.columnDef.header as React.ReactNode)}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{cell.getValue() as React.ReactNode}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableEmpty colSpan={eventColumns.length}>
              <EmptyState title="Нет событий" />
            </TableEmpty>
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
