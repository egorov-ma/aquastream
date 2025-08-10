export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

import { ProfileForm } from "@/components/dashboard/ProfileForm";
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
            <button type="submit" className="h-8 rounded-md border px-3 text-sm hover:bg-muted/50">Выйти</button>
          </form>
        </div>
      </div>
      <ProfileForm />
    </section>
  );
}


