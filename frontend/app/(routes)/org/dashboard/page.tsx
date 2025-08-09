"use client";

import * as React from "react";
import { AppSidebar } from "@/components/org-dashboard/AppSidebar";
import { SiteHeader } from "@/components/org-dashboard/SiteHeader";
import { SectionCards } from "@/components/org-dashboard/SectionCards";
import { DataTable } from "@/components/org-dashboard/DataTable";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default function OrganizerDashboardPage() {
  return (
    <section data-test-id="page-organizer-dashboard" className="grid gap-4 md:grid-cols-[240px_1fr] min-h-[70vh]">
      <aside className="hidden md:block border rounded-md p-3"><AppSidebar /></aside>
      <div className="grid gap-4">
        <SiteHeader />
        <SectionCards />
        <DataTable />
      </div>
    </section>
  );
}


