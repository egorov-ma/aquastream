export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderDescription, PageHeaderHeading, PageHeaderActions } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Личный кабинет — AquaStream",
  description: "Профиль участника и верификация Telegram.",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <Section data-test-id="page-dashboard" width="3xl" gap="lg">
      <PageHeader>
        <PageHeaderHeading>Личный кабинет</PageHeaderHeading>
        <PageHeaderDescription>Профиль и верификация Telegram.</PageHeaderDescription>
        <PageHeaderActions>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" size="sm">Выйти</Button>
          </form>
        </PageHeaderActions>
      </PageHeader>
      <ProfileForm />
    </Section>
  );
}
