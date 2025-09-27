export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Stack } from "@/components/ui/stack";

export const metadata: Metadata = {
  title: "Личный кабинет — AquaStream",
  description: "Профиль участника и верификация Telegram.",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <Section data-test-id="page-dashboard" width="normal" gap="lg">
      <Stack gap="xs">
        <h1 className="text-xl font-semibold">Личный кабинет</h1>
        <Stack
          direction="row"
          gap="sm"
          align="center"
          justify="between"
          className="gap-y-2"
        >
          <p className="text-muted-foreground">Профиль и верификация Telegram</p>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" size="sm">Выйти</Button>
          </form>
        </Stack>
      </Stack>
      <ProfileForm />
    </Section>
  );
}
