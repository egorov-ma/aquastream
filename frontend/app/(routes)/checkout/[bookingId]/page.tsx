import { PaymentWidget } from "@/components/checkout/PaymentWidget";
import { QrSection } from "@/components/checkout/QrSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resolveApiOrigin } from "@/lib/server/resolve-api-origin";

export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

export default async function CheckoutPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const { bookingId } = params;
  const origin = resolveApiOrigin();
  const res = await fetch(`${origin}/api/bookings/${bookingId}`, { cache: 'no-store' });
  const booking = res.ok ? await res.json() : null;
  return (
    <section data-test-id="page-checkout">
      <h1 className="text-xl font-semibold">Оплата брони #{bookingId}</h1>
      {booking ? (
        <div className="mt-4 grid gap-2">
          <div className="text-sm text-muted-foreground">Событие: {booking.event.title}</div>
          <div className="text-sm text-muted-foreground">Сумма к оплате: {booking.amount} ₽</div>
          <div className="text-sm">Статус: {booking.status}</div>
          <div className="my-3 h-px w-full bg-border" />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h2 className="font-medium">Оплата виджетом</h2>
              <PaymentSection bookingId={bookingId} />
            </div>
            <div>
              <h2 className="font-medium">Оплата по QR (пруф)</h2>
              <QrSection bookingId={bookingId} />
            </div>
          </div>
        </div>
      ) : <CheckoutFallback />}
    </section>
  );
}

function CheckoutFallback() {
  return (
    <div className="mt-4 grid gap-3">
      <Alert variant="destructive">
        <AlertDescription>Не удалось загрузить данные брони. Повторите попытку позже.</AlertDescription>
      </Alert>
      <div className="grid gap-2">
        <div className="text-sm text-muted-foreground">Загрузка информации…</div>
        <div className="grid gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

function PaymentSection({ bookingId }: { bookingId: string }) {
  return (
    <div>
      <PaymentWidget bookingId={bookingId} />
    </div>
  );
}
