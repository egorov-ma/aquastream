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

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default function OrganizerDashboardPage() {
  return (
    <SidebarProvider style={{ ["--sidebar-width" as unknown as string]: "280px" }}>
      <aside className="hidden md:block w-[280px] border rounded-md p-3"><AppSidebar /></aside>
      <SidebarInset>
        <section data-test-id="page-organizer-dashboard" className="grid gap-4 min-h-[70vh]">
          <SiteHeader />
          <PageHeader
            title="Панель организатора"
            description="Обзор метрик и управление событиями"
            actions={(
              <>
                <Link href="/org/dashboard/settings" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Настройки</Link>
                <Link href="/org/dashboard/groups" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Группы</Link>
                <Link href="/org/dashboard/moderation" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Модерация оплат</Link>
                <Link href="/admin" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Админ</Link>
                <Link href="/org/dashboard/new" className="h-9 rounded-md border px-3 text-sm hover:bg-muted/50">Новое событие</Link>
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


