export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет — AquaStream",
  description: "Профиль участника и верификация Telegram.",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <section data-test-id="page-dashboard" className="grid gap-6">
      <div>
        <h1 className="text-xl font-semibold">Личный кабинет</h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-muted-foreground">Профиль и верификация Telegram</p>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" size="sm">Выйти</Button>
          </form>
        </div>
      </div>
      <ProfileForm />
    </section>
  );
}


