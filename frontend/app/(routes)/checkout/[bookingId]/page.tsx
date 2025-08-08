export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <section data-test-id="page-checkout">
      <h1 className="text-xl font-semibold">Оплата брони #{bookingId}</h1>
      <p className="mt-2 text-muted-foreground">Виджет/QR (заглушка)</p>
    </section>
  );
}


