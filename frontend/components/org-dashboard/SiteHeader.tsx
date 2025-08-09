"use client";
import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Панель организатора</h1>
      </div>
      <div className="text-sm text-muted-foreground">Сегодня: {new Date().toLocaleDateString()}</div>
    </header>
  );
}


