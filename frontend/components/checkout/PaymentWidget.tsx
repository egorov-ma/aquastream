"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  bookingId: string;
  provider?: "yookassa" | "cloudpayments" | "stripe";
};

export function PaymentWidget({ bookingId, provider = ((process.env.PAYMENTS_PROVIDER as string | undefined) as Props["provider"]) || "yookassa" }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<null | "success" | "cancel">(null);

  const onSuccess = async () => {
    setLoading(true);
    try {
      await fetch("/api/webhooks/payment/yookassa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ object: { metadata: { bookingId }, status: "succeeded" } }),
      });
      setResult("success");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    setLoading(true);
    try {
      await fetch("/api/webhooks/payment/yookassa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ object: { metadata: { bookingId }, status: "canceled" } }),
      });
      setResult("cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 grid gap-3">
      <div className="text-sm text-muted-foreground">Провайдер оплаты: {provider}</div>
      <div className="flex gap-2">
        <Button onClick={onSuccess} disabled={loading}>Оплатить</Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Отменить</Button>
      </div>
      {result === "success" && (
        <Alert>
          <AlertDescription>Оплата успешна. Статус брони изменён на paid.</AlertDescription>
        </Alert>
      )}
      {result === "cancel" && (
        <Alert>
          <AlertDescription>Оплата отменена. Вы можете попробовать снова.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}


