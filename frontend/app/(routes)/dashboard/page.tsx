export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function DashboardPage() {
  return (
    <section data-test-id="page-dashboard" className="grid gap-6">
      <div>
        <h1 className="text-xl font-semibold">Личный кабинет</h1>
        <p className="mt-2 text-muted-foreground">Профиль и верификация Telegram</p>
      </div>
      <ProfileForm />
    </section>
  );
}


