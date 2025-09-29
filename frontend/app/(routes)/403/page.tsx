export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Stack } from "@/components/ui/stack";

export default function ForbiddenPage() {
  return (
    <Section
      data-test-id="page-403"
      align="center"
      width="sm"
      padding="xl"
      gap="md"
    >
      <PageHeader className="text-center">
        <PageHeaderHeading className="mx-auto">Доступ запрещён</PageHeaderHeading>
        <PageHeaderDescription>У вас нет прав для просмотра этой страницы.</PageHeaderDescription>
      </PageHeader>
      <Stack direction="row" gap="xs" align="center" justify="center" wrap="wrap">
        <Button asChild variant="outline" size="sm"><Link href="/">На главную</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href="/login">Войти</Link></Button>
      </Stack>
    </Section>
  );
}

