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
        <p className="mt-2 text-destructive">Не удалось загрузить данные брони</p>
      )}
    </section>
  );
}


