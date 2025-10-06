import { PaymentWidget } from "@/components/checkout/PaymentWidget";
import { QrSection } from "@/components/checkout/QrSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { resolveApiOrigin } from "@/lib/server/resolve-api-origin";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const origin = await resolveApiOrigin();
  const res = await fetch(`${origin}/api/bookings/${bookingId}`, { cache: "no-store" });
  const booking = res.ok ? await res.json() : null;

  return (
    <Section data-test-id="page-checkout" gap="md">
      <PageHeader>
        <PageHeaderHeading>Оплата брони #{bookingId}</PageHeaderHeading>
        <PageHeaderDescription>
          Выберите удобный способ оплаты или загрузите подтверждение перевода.
        </PageHeaderDescription>
      </PageHeader>
      {booking ? (
        <div className="grid gap-4">
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span>Событие: {booking.event.title}</span>
            <span>Сумма к оплате: {booking.amount} ₽</span>
            <span className="text-foreground">Статус: {booking.status}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-base font-medium">Оплата виджетом</h2>
              <PaymentSection bookingId={bookingId} />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-medium">Оплата по QR (пруф)</h2>
              <QrSection bookingId={bookingId} />
            </div>
          </div>
        </div>
      ) : (
        <CheckoutFallback />
      )}
    </Section>
  );
}

function CheckoutFallback() {
  return (
    <div className="grid gap-3">
      <Alert variant="destructive">
        <AlertDescription>
          Не удалось загрузить данные брони. Повторите попытку позже.
        </AlertDescription>
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
  return <PaymentWidget bookingId={bookingId} />;
}
