"use client";
import * as React from "react";

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

type ProviderProps = React.PropsWithChildren<{ style?: React.CSSProperties }>;

export function SidebarProvider({ children, style }: ProviderProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const value = React.useMemo<SidebarContextValue>(() => ({ collapsed, toggle: () => setCollapsed((v) => !v) }), [collapsed]);
  return (
    <SidebarContext.Provider value={value}>
      <div className="flex gap-4" data-collapsed={collapsed ? "icon" : "full"} style={style}>
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
    <button type="button" onClick={toggle} className={"inline-flex h-8 items-center rounded-md border px-2 text-sm hover:bg-muted/50 " + (className ?? "")}>≡</button>
  );
}


