"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";

export function WaitlistSection({ eventId, initialCount, initialJoined }: { eventId: string; initialCount: number; initialJoined: boolean }) {
  const [count, setCount] = React.useState<number>(initialCount);
  const [joined, setJoined] = React.useState<boolean>(initialJoined);
  const [pending, setPending] = React.useState<boolean>(false);

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    const userId = "u_user1"; // dev-only stub
    const prev = { joined, count };
    try {
      // optimistic
      if (!joined) {
        setJoined(true);
        setCount((c) => c + 1);
        const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error("join failed");
      } else {
        setJoined(false);
        setCount((c) => Math.max(0, c - 1));
        const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/waitlist`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error("leave failed");
      }
    } catch {
      // rollback
      setJoined(prev.joined);
      setCount(prev.count);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mt-4" data-test-id="waitlist-section">
      <Card className="[contain:content]">
        <CardContent className="flex items-center justify-between p-3">
          <div>
            <div className="font-medium">Лист ожидания</div>
            <div className="text-sm text-muted-foreground">В очереди: {count}</div>
            <div className="mt-1 text-xs">Статус: {joined ? "в очереди" : "не в очереди"}</div>
          </div>
          <Button type="button" aria-label="Переключить" onClick={toggle} disabled={pending} variant="outline" size="sm">
            {joined ? "Выйти из очереди" : "Встать в очередь"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}


