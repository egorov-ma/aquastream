"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/states";

type Organizer = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  brandColor?: string;
};

export function OrgHeader({ slug }: { slug: string }) {
  const [data, setData] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = base
      ? `${base.replace(/\/$/, "")}/organizers/${slug}`
      : `/organizers/${slug}`;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load organizer (${res.status})`);
        const json: Organizer = await res.json();
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to fetch organizer", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setData(null);
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

  if (error) {
    return (
      <div className="space-y-1" data-test-id="org-header">
        <ErrorState
          message="Не удалось загрузить данные организатора"
          description={error}
        />
      </div>
    );
  }

  const accent = data?.brandColor || "#6366f1"; // fallback Indigo-500
  const ACCENT_CSS_VAR = "--accent" as const;

  return (
    <div className="space-y-1" data-test-id="org-header" style={{ [ACCENT_CSS_VAR]: accent } as CSSProperties}>
      <div className="flex items-center gap-2 border-b pb-2 border-[var(--accent)]">
        <h1 className="text-2xl font-semibold">
          {loading ? "…" : data?.name ?? slug}
        </h1>
        <Badge variant="secondary" className="bg-[color:var(--accent)/0.125] text-[var(--accent)]">
          Организатор
        </Badge>
      </div>
      {data?.description && (
        <p className="text-sm text-muted-foreground">{data.description}</p>
      )}
    </div>
  );
}
