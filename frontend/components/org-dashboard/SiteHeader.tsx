"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Toolbar, ToolbarGroup, ToolbarSpacer } from "@/components/ui/toolbar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  const today = React.useMemo(
    () => new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(new Date()),
    [],
  );

  return (
    <Toolbar border={false} className="px-0">
      <ToolbarGroup>
        <SidebarTrigger />
        <span className="text-sm font-medium text-muted-foreground">Навигация</span>
      </ToolbarGroup>
      <ToolbarSpacer />
      <ToolbarGroup>
        <span className="hidden text-sm text-muted-foreground md:inline">Сегодня: {today}</span>
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="outline" size="sm">
            Выйти
          </Button>
        </form>
      </ToolbarGroup>
    </Toolbar>
  );
}

