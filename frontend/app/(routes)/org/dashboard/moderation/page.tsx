"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Section } from "@/components/ui/section";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

type QueueItem = { id: string; proofUrl?: string; amount: number; eventId: string; status: string };

export default function ModerationPage() {
  const [items, setItems] = React.useState<QueueItem[]>([]);
  const [preview, setPreview] = React.useState<QueueItem | null>(null);
  const [comment, setComment] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/organizer/moderation/queue", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Не удалось получить очередь модерации");
      }
      const payload = (await res.json()) as { items?: QueueItem[] };
      setItems(payload.items ?? []);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error(err);
      }
      setItems([]);
      setError("Не удалось получить очередь модерации");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: "accept" | "reject") => {
    await fetch("/api/organizer/moderation/queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, comment: comment || undefined }),
    });
    toast.success(action === "accept" ? "Оплата подтверждена" : "Оплата отклонена");
    setComment("");
    setPreview(null);
    void load();
  };

  return (
    <Section data-test-id="page-organizer-moderation" gap="lg">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Модерация оплат</h1>
          <p className="text-sm text-muted-foreground mt-1">Проверка подтверждений переводов</p>
        </div>
      </div>
      <DataTableShell title="Очередь оплат">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID брони</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Доказательство</TableHead>
              <TableHead className="w-[220px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableEmpty colSpan={4} className="bg-background/40">
                <LoadingState />
              </TableEmpty>
            ) : error ? (
              <TableEmpty colSpan={4}>
                <ErrorState message={error} onRetry={load} />
              </TableEmpty>
            ) : items.length === 0 ? (
              <TableEmpty colSpan={4}>
                <EmptyState title="Очередь пустая" />
              </TableEmpty>
            ) : (
              items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.amount}</TableCell>
                  <TableCell>
                    {b.proofUrl ? (
                      <Dialog open={preview?.id === b.id} onOpenChange={(o) => setPreview(o ? b : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Превью
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[640px]">
                          <DialogHeader>
                            <DialogTitle>Пруф оплаты</DialogTitle>
                          </DialogHeader>
                          {b.proofUrl ? (
                            <Image
                              alt="proof"
                              src={b.proofUrl}
                              width={600}
                              height={600}
                              className="h-auto w-full rounded-md border"
                            />
                          ) : null}
                          <Textarea
                            placeholder="Комментарий (опц.)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => void act(b.id, "reject")} variant="destructive">
                              Отклонить
                            </Button>
                            <Button onClick={() => void act(b.id, "accept")}>Принять</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="secondary" onClick={() => setPreview(b)}>
                      Открыть
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </Section>
  );
}
