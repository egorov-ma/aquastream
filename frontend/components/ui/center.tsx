import * as React from "react";

import { cn } from "@/lib/utils";

type CenterProps = React.HTMLAttributes<HTMLDivElement> & {
  innerClassName?: string;
  maxWidth?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  padding?: "sm" | "md" | "lg";
};

const maxWidthMap: Record<NonNullable<CenterProps["maxWidth"]>, string> = {
  none: "",
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

const paddingMap: Record<NonNullable<CenterProps["padding"]>, string> = {
  sm: "p-4 md:p-6",
  md: "p-6 md:p-10",
  lg: "p-8 md:p-12",
};

export function Center({
  className,
  innerClassName,
  maxWidth = "sm",
  padding = "md",
  children,
  ...props
}: CenterProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full items-center justify-center",
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      <div className={cn("w-full", maxWidthMap[maxWidth], innerClassName)}>{children}</div>
    </div>
  );
}

