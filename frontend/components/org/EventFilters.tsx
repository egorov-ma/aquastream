"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export type EventFiltersState = {
  q: string;
  minPrice?: number;
  maxPrice?: number;
  minCap?: number;
  maxCap?: number;
  from?: string; // ISO yyyy-mm-dd
  to?: string;   // ISO yyyy-mm-dd
};

const parseNumber = (v: string | null): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function useEventFilters(): [EventFiltersState, (next: EventFiltersState) => void, () => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = useMemo<EventFiltersState>(() => {
    return {
      q: params.get("q") || "",
      minPrice: parseNumber(params.get("minPrice")),
      maxPrice: parseNumber(params.get("maxPrice")),
      minCap: parseNumber(params.get("minCap")),
      maxCap: parseNumber(params.get("maxCap")),
      from: params.get("from") || undefined,
      to: params.get("to") || undefined,
    };
  }, [params]);

  const setState = (next: EventFiltersState) => {
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.minPrice != null) sp.set("minPrice", String(next.minPrice));
    if (next.maxPrice != null) sp.set("maxPrice", String(next.maxPrice));
    if (next.minCap != null) sp.set("minCap", String(next.minCap));
    if (next.maxCap != null) sp.set("maxCap", String(next.maxCap));
    if (next.from) sp.set("from", next.from);
    if (next.to) sp.set("to", next.to);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const reset = () => router.replace(pathname);

  return [current, setState, reset];
}

export function EventFilters({ value, onChange, onReset }: {
  value: EventFiltersState;
  onChange: (v: EventFiltersState) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState<EventFiltersState>(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const id = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(id);
  }, [local, onChange]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-test-id="event-filters">
      <Input
        placeholder="Поиск"
        value={local.q}
        onChange={(e) => setLocal({ ...local, q: e.target.value })}
      />
      <Input
        placeholder="Мин. цена"
        type="number"
        value={local.minPrice ?? ""}
        onChange={(e) => setLocal({ ...local, minPrice: e.target.value ? Number(e.target.value) : undefined })}
      />
      <Input
        placeholder="Макс. цена"
        type="number"
        value={local.maxPrice ?? ""}
        onChange={(e) => setLocal({ ...local, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
      />
      <Input
        placeholder="Мин. мест"
        type="number"
        value={local.minCap ?? ""}
        onChange={(e) => setLocal({ ...local, minCap: e.target.value ? Number(e.target.value) : undefined })}
      />
      <Input
        placeholder="Макс. мест"
        type="number"
        value={local.maxCap ?? ""}
        onChange={(e) => setLocal({ ...local, maxCap: e.target.value ? Number(e.target.value) : undefined })}
      />
      <div className="flex items-center gap-2">
        <DatePicker label="c" value={local.from} onChange={(d) => setLocal({ ...local, from: d })} />
        <DatePicker label="по" value={local.to} onChange={(d) => setLocal({ ...local, to: d })} />
      </div>
      <div className="col-span-2 flex gap-2 sm:col-span-3 lg:col-span-6">
        <Button variant="outline" onClick={onReset} data-test-id="filters-reset">Сбросить</Button>
      </div>
    </div>
  );
}

function DatePicker({ label, value, onChange }: { label: string; value?: string; onChange: (iso?: string) => void }) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-28 justify-start">
          {label}: {value ?? "-"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? d.toISOString().slice(0, 10) : undefined);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}


