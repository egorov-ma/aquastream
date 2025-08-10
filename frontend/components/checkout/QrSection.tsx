"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

export function QrSection({ bookingId }: { bookingId: string }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setMessage(null);
  };

  const onUpload = async () => {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setMessage("Разрешены только изображения");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Максимальный размер 5MB");
      return;
    }
    setUploading(true);
    setProgress(0);
    // эмуляция прогресса
    const timer = setInterval(() => setProgress((p) => Math.min(100, p + 10)), 100);
    try {
      await fetch("/api/payments/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, fileName: file.name, fileSize: file.size }),
      });
      setMessage("Пруф отправлен. Статус брони — submitted, ожидает модерации.");
    } finally {
      clearInterval(timer);
      setProgress(100);
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="text-sm text-muted-foreground">Оплата по QR: отсканируйте и переведите сумму, затем загрузите скрин чека.</div>
      <div className="grid gap-2">
        <Input type="file" accept="image/*" onChange={onFileChange} className="h-11 md:h-10" />
        {uploading && <Progress value={progress} />}
        {message && <div className="text-sm">{message}</div>}
      </div>
      <div>
        <Button onClick={onUpload} disabled={!file || uploading} className="h-11 px-4 md:h-9">Загрузить пруф</Button>
      </div>
    </div>
  );
}


