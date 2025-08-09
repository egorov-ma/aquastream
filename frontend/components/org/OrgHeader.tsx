"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = base
      ? `${base.replace(/\/$/, "")}/organizers/${slug}`
      : `/organizers/${slug}`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: Organizer) => setData(json))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug]);

  const accent = data?.brandColor || "#6366f1"; // fallback Indigo-500

  return (
    <div className="space-y-1" data-test-id="org-header">
      <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: accent }}>
        <h1 className="text-2xl font-semibold">
          {loading ? "…" : data?.name ?? slug}
        </h1>
        <Badge variant="secondary" style={{ backgroundColor: accent + "20", color: accent }}>
          Организатор
        </Badge>
      </div>
      {data?.description && (
        <p className="text-sm text-muted-foreground">{data.description}</p>
      )}
    </div>
  );
}


