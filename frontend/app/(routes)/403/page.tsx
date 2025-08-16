export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <section data-test-id="page-403" className="grid gap-4 text-center py-16">
      <h1 className="text-2xl font-semibold">Доступ запрещён</h1>
      <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
      <div className="flex items-center justify-center gap-2">
        <Button asChild variant="outline" size="sm"><Link href="/">На главную</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href="/login">Войти</Link></Button>
      </div>
    </section>
  );
}


