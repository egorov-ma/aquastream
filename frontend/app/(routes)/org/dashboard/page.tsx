"use client";

import * as React from "react";
import { AppSidebar } from "@/components/org-dashboard/AppSidebar";
import { SiteHeader } from "@/components/org-dashboard/SiteHeader";
import { SectionCards } from "@/components/org-dashboard/SectionCards";
import { DataTable } from "@/components/org-dashboard/DataTable";
import { ChartArea } from "@/components/org-dashboard/ChartArea";
import { SidebarProvider, SidebarInset, Sidebar } from "@/components/ui/sidebar";
import { Section } from "@/components/ui/section";
import Link from "next/link";
import { useRole } from "@/shared/client-auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default function OrganizerDashboardPage() {
  const role = useRole();
  return (
    <SidebarProvider>
      <Sidebar data-test-id="dashboard-sidebar" aria-label="Навигация по панели организатора">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Section data-test-id="page-organizer-dashboard" gap="lg" className="min-h-[70vh]">
          <SiteHeader />
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Панель организатора</h1>
              <p className="text-sm text-muted-foreground mt-1">Обзор метрик и управление событиями</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/settings">Настройки</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/groups">Группы</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/moderation">Модерация оплат</Link></Button>
              {role === "admin" ? (
                <Button asChild variant="outline" size="sm"><Link href="/admin">Админ</Link></Button>
              ) : null}
              <Button asChild variant="outline" size="sm"><Link href="/org/dashboard/new">Новое событие</Link></Button>
            </div>
          </div>
          <SectionCards />
          <ChartArea />
          <DataTable />
        </Section>
      </SidebarInset>
    </SidebarProvider>
  );
}
