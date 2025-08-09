"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { title: "Активные события", value: 3 },
        { title: "Участников", value: 128 },
        { title: "Доход (мес)", value: "₽ 245 000" },
        { title: "Заявок на модерации", value: 5 },
      ].map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{c.title}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{c.value}</div></CardContent>
        </Card>
      ))}
    </div>
  );
}


