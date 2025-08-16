"use client";

import * as React from "react";
import { AppSidebar } from "@/components/org-dashboard/AppSidebar";
import { SiteHeader } from "@/components/org-dashboard/SiteHeader";
import { SectionCards } from "@/components/org-dashboard/SectionCards";
import { DataTable } from "@/components/org-dashboard/DataTable";
import { ChartArea } from "@/components/org-dashboard/ChartArea";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { useRole } from "@/shared/client-auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default function OrganizerDashboardPage() {
  const role = useRole();
  return (
    <SidebarProvider>
      <aside className="hidden md:block w-[280px] border rounded-md p-3"><AppSidebar /></aside>
      <SidebarInset>
        <section data-test-id="page-organizer-dashboard" className="grid gap-4 min-h-[70vh]">
          <SiteHeader />
          <PageHeader
            title="Панель организатора"
            description="Обзор метрик и управление событиями"
            actions={(
              <>
                <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/settings">Настройки</Link></Button>
                <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/groups">Группы</Link></Button>
                <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/moderation">Модерация оплат</Link></Button>
                {role === "admin" ? (
                  <Button asChild variant="outline" size="sm"><Link href="/admin">Админ</Link></Button>
                ) : null}
                <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/new">Новое событие</Link></Button>
              </>
            )}
          />
          <SectionCards />
          <ChartArea />
          <DataTable />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}


