export const dynamic = "force-dynamic";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section data-test-id="page-403" className="grid gap-4 text-center py-16">
      <h1 className="text-2xl font-semibold">Доступ запрещён</h1>
      <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
      <div className="flex items-center justify-center gap-2">
        <Link href="/" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">На главную</Link>
        <Link href="/login" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Войти</Link>
      </div>
    </section>
  );
}


