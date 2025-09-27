"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ToolbarProps = React.HTMLAttributes<HTMLDivElement> & {
  justify?: "between" | "start" | "end" | "center";
  border?: boolean;
};

export function Toolbar({ className, justify = "between", border = true, ...props }: ToolbarProps) {
  const justifyClass =
    justify === "between"
      ? "justify-between"
      : justify === "start"
      ? "justify-start"
      : justify === "end"
      ? "justify-end"
      : "justify-center";

  return (
    <div
      data-slot="toolbar"
      className={cn(
        "flex items-center gap-2 sm:gap-3 py-2 sm:py-3",
        border && "border-b",
        justifyClass,
        className
      )}
      {...props}
    />
  );
}

export function ToolbarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 sm:gap-3", className)} {...props} />;
}

export function ToolbarSpacer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1", className)} {...props} />;
}

