export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/bookings/${bookingId}`, { cache: 'no-store' });
  const booking = res.ok ? await res.json() : null;
  return (
    <section data-test-id="page-checkout">
      <h1 className="text-xl font-semibold">Оплата брони #{bookingId}</h1>
      {booking ? (
        <div className="mt-4 grid gap-2">
          <div className="text-sm text-muted-foreground">Событие: {booking.event.title}</div>
          <div className="text-sm text-muted-foreground">Сумма к оплате: {booking.amount} ₽</div>
          <div className="text-sm">Статус: {booking.status}</div>
        </div>
      ) : (
        <CheckoutFallback />
      )}
    </section>
  );
}

function CheckoutFallback() {
  // В SSR узнаём об ошибке только по res.ok; покажем Alert и Skeleton
  return (
    <div className="mt-4 grid gap-3">
      <div role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
        Не удалось загрузить данные брони. Повторите попытку позже.
      </div>
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


