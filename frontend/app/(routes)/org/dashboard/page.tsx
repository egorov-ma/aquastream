"use client";

import * as React from "react";
import { AppSidebar } from "@/components/org-dashboard/AppSidebar";
import { SiteHeader } from "@/components/org-dashboard/SiteHeader";
import { SectionCards } from "@/components/org-dashboard/SectionCards";
import { DataTable } from "@/components/org-dashboard/DataTable";
import { ChartArea } from "@/components/org-dashboard/ChartArea";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default function OrganizerDashboardPage() {
  return (
    <SidebarProvider style={{ ["--sidebar-width" as unknown as string]: "280px" }}>
      <aside className="hidden md:block w-[280px] border rounded-md p-3"><AppSidebar /></aside>
      <SidebarInset>
        <section data-test-id="page-organizer-dashboard" className="grid gap-4 min-h-[70vh]">
          <SiteHeader />
          <SectionCards />
          <ChartArea />
          <DataTable />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}


