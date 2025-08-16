"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export type EventCardProps = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  location?: string | null;
  capacity?: number | null;
  available?: number | null;
  difficulty?: number | null; // 1..5
  features?: string[]; // произвольные пункты (иконки/эмоджи можно в тексте)
};

// Кешируем форматтеры дат (снижение TBT)
const DATE_FMT = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const TIME_FMT = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

export function EventCard({ id, title, dateStart, dateEnd, location, capacity, available, difficulty, features }: EventCardProps) {
  const taken = Math.max(0, (capacity ?? 0) - (available ?? 0));
  const percent = capacity && capacity > 0 ? Math.round((taken / capacity) * 100) : 0;

  return (
    <Card className="w-full min-h-48 [contain:content]">
      <CardHeader>
        <CardTitle className="text-xl leading-tight">
          <Link href={`/events/${id}`} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        <CardDescription>
          <DateRange dateStart={dateStart} dateEnd={dateEnd} />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {location && (
          <div className="text-sm text-muted-foreground">📍 {location}</div>
        )}
        {capacity != null && (
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>{taken} из {capacity} участников</span>
              <span>{percent}%</span>
            </div>
            <Progress value={percent} />
          </div>
        )}
        {typeof difficulty === "number" && difficulty > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span>Сложность:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    "inline-block h-3 w-3 rounded-full " +
                    (i < (difficulty ?? 0) ? "bg-destructive/80" : "bg-muted")
                  }
                />
              ))}
            </div>
          </div>
        )}
        {features && features.length > 0 && (
          <ul className="mt-1 grid gap-2 text-sm">
            {features.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-destructive">✔</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <Separator className="my-2" />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/events/${id}`}>Подробнее</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function DateRange({ dateStart, dateEnd }: { dateStart: string; dateEnd?: string | null }) {
  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : null;
  const left = DATE_FMT.format(start);
  const right: string | null = end ? (start.toDateString() === end.toDateString() ? TIME_FMT.format(end) : DATE_FMT.format(end)) : null;
  return (
    <div className="flex items-center gap-2">
      <span>{left}</span>
      {right && <span className="text-destructive">—</span>}
      {right && <span>{right}</span>}
    </div>
  );
}


