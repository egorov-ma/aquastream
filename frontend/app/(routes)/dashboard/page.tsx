export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

export default function DashboardPage() {
  return (
    <section data-test-id="page-dashboard">
      <h1 className="text-xl font-semibold">Личный кабинет</h1>
      <p className="mt-2 text-muted-foreground">Роль-зависимый кабинет (заглушка)</p>
    </section>
  );
}


