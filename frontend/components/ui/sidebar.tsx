"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

type ProviderProps = React.PropsWithChildren<unknown>;

export function SidebarProvider({ children }: ProviderProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const value = React.useMemo<SidebarContextValue>(() => ({ collapsed, toggle: () => setCollapsed((v) => !v) }), [collapsed]);
  return (
    <SidebarContext.Provider value={value}>
      <div className="flex gap-4 [--sidebar-width:280px]" data-collapsed={collapsed ? "icon" : "full"}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarInset({ children }: React.PropsWithChildren) {
  return <div className="flex-1 min-w-0">{children}</div>;
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar();
  return (
    <Button type="button" onClick={toggle} variant="outline" size="sm" className={className}>≡</Button>
  );
}


