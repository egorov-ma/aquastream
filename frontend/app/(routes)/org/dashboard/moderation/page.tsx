"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type QueueItem = { id: string; proofUrl?: string; amount: number; eventId: string; status: string };

export default function ModerationPage() {
  const [items, setItems] = React.useState<QueueItem[]>([]);
  const [preview, setPreview] = React.useState<QueueItem | null>(null);
  const [comment, setComment] = React.useState("");

  const load = React.useCallback(async () => {
    const res = await fetch("/api/organizer/moderation/queue", { cache: "no-store" });
    if (res.ok) setItems(((await res.json()).items ?? []) as QueueItem[]);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const act = async (id: string, action: "accept" | "reject") => {
    await fetch("/api/organizer/moderation/queue", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, comment: comment || undefined }) });
    toast.success(action === "accept" ? "Оплата подтверждена" : "Оплата отклонена");
    setComment("");
    setPreview(null);
    load();
  };

  return (
    <section className="grid gap-4" data-test-id="page-organizer-moderation">
      <h1 className="text-lg font-semibold">Модерация оплат</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID брони</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Доказательство</TableHead>
              <TableHead className="w-[220px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Очередь пустая</TableCell></TableRow>
            )}
            {items.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.amount}</TableCell>
                <TableCell>
                  {b.proofUrl ? (
                    <Dialog open={preview?.id === b.id} onOpenChange={(o) => setPreview(o ? b : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Превью</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[640px]">
                        <DialogHeader><DialogTitle>Пруф оплаты</DialogTitle></DialogHeader>
                        {b.proofUrl && (
                          <Image alt="proof" src={b.proofUrl} width={600} height={600} className="h-auto w-full rounded-md border" />
                        )}
                        <Textarea placeholder="Комментарий (опц.)" value={comment} onChange={(e) => setComment(e.target.value)} />
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => act(b.id, "reject")} variant="destructive">Отклонить</Button>
                          <Button onClick={() => act(b.id, "accept")} >Принять</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="secondary" onClick={() => setPreview(b)}>Открыть</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}


