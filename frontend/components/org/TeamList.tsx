"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type Member = { id: string; name: string; role: string };

export function TeamList({}: { slug: string }) {
  // Заглушка списка команды (моки позже)
  const members: Member[] = [
    { id: "m1", name: "Анна Петрова", role: "Организатор" },
    { id: "m2", name: "Иван Сидоров", role: "Технический директор" },
  ];
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-test-id="org-team">
      {members.map((m) => (
        <li key={m.id}>
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <Avatar>
                <AvatarFallback>{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.role}</div>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}


