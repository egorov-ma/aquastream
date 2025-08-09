"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  dateStart: string;
  price?: number;
  capacity?: number;
  available?: number;
};

export function EventList({ slug }: { slug: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = base
      ? `${base.replace(/\/$/, "")}/organizers/${slug}/events`
      : `/organizers/${slug}/events`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: { items: Item[] }) => setItems(json.items))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug]);

  if (loading) return <p>Загрузка…</p>;
  if (!items.length) return <p>Событий пока нет</p>;

  return (
    <ul className="space-y-3" data-test-id="org-events">
      {items.map((e) => (
        <li key={e.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(e.dateStart).toLocaleString()}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {typeof e.price === "number" && <div>₽ {e.price}</div>}
              {typeof e.capacity === "number" && (
                <div>
                  Места: {e.available ?? 0}/{e.capacity}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}


