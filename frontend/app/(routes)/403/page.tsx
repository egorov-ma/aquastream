export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Stack } from "@/components/ui/stack";

export default function ForbiddenPage() {
  return (
    <Section
      data-test-id="page-403"
      align="center"
      width="narrow"
      padding="xl"
      gap="md"
    >
      <Stack gap="sm" align="center" className="text-center">
        <h1 className="text-2xl font-semibold">Доступ запрещён</h1>
        <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
      </Stack>
      <Stack direction="row" gap="xs" align="center" justify="center" wrap="wrap">
        <Button asChild variant="outline" size="sm"><Link href="/">На главную</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href="/login">Войти</Link></Button>
      </Stack>
    </Section>
  );
}

