"use client";
import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Панель организатора</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden md:inline">Сегодня: {new Date().toLocaleDateString()}</span>
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="outline" size="sm">Выйти</Button>
        </form>
      </div>
    </header>
  );
}


