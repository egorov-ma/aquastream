"use client";
import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
  sidebarId: string;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

type SidebarProviderProps = React.PropsWithChildren<{
  defaultCollapsed?: boolean;
  width?: number | string;
  className?: string;
}>;

export function SidebarProvider({ children, defaultCollapsed = false, width = 280, className }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const sidebarId = React.useId();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCollapsed(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ collapsed, toggle: () => setCollapsed((v) => !v), setCollapsed, sidebarId }),
    [collapsed, sidebarId],
  );

  const resolvedWidth = typeof width === "number" ? `${width}px` : width;

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-sidebar-state={collapsed ? "collapsed" : "expanded"}
        className={cn("flex w-full items-start gap-4 transition-[gap] duration-200 ease-in-out", collapsed && "gap-0", className)}
        style={{ "--sidebar-width": resolvedWidth } as React.CSSProperties}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentProps<"aside">;

export function Sidebar({ className, id, tabIndex, ...props }: SidebarProps) {
  const { collapsed, sidebarId } = useSidebar();
  const resolvedId = id ?? sidebarId;

  return (
    <aside
      id={resolvedId}
      data-state={collapsed ? "collapsed" : "expanded"}
      aria-hidden={collapsed}
      tabIndex={collapsed ? -1 : tabIndex}
      className={cn(
        "hidden w-[var(--sidebar-width)] shrink-0 overflow-hidden rounded-md border bg-sidebar p-3 text-sidebar-foreground shadow-sm transition-[width,padding,opacity] duration-200 ease-in-out md:flex md:flex-col",
        collapsed && "w-0 max-w-0 p-0 opacity-0 pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarInset({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex-1 min-w-0", className)}>{children}</div>;
}

type SidebarTriggerProps = React.ComponentProps<typeof Button>;

export function SidebarTrigger({ className, variant, size, onClick, ...props }: SidebarTriggerProps) {
  const { toggle, collapsed, sidebarId } = useSidebar();

  const handleClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) toggle();
    },
    [onClick, toggle],
  );

  const label = collapsed ? "Открыть меню" : "Свернуть меню";

  return (
    <Button
      type="button"
      variant={variant ?? "outline"}
      size={size ?? "icon"}
      aria-expanded={!collapsed}
      aria-controls={sidebarId}
      aria-label={label}
      data-state={collapsed ? "collapsed" : "expanded"}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
