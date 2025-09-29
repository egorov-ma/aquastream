"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toolbarVariants = cva(
  "flex w-full items-center gap-3 rounded-lg border border-transparent bg-background/70 px-4 py-2 text-sm shadow-sm transition-colors backdrop-blur supports-[backdrop-filter]:bg-background/50",
  {
    variants: {
      variant: {
        default: "",
        subtle: "bg-muted/60 text-muted-foreground",
        surface: "border-border/60 bg-card text-card-foreground",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      size: {
        sm: "h-10 gap-2 px-3 py-1.5 text-xs sm:text-sm",
        md: "h-11 gap-3 px-4 py-2 text-sm",
        lg: "min-h-[3.25rem] gap-4 px-5 py-3 text-base",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
      },
      border: {
        true: "border-border/60 shadow-sm",
        false: "border-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      justify: "between",
      border: true,
    },
  },
);

export interface ToolbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolbarVariants> {
  /**
   * Optional aria-roledescription for assistive tech. Defaults to "Toolbar".
   */
  roleDescription?: string;
  /**
   * Toolbar orientation. Horizontal by default.
   */
  orientation?: "horizontal" | "vertical";
}

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      className,
      justify,
      variant,
      size,
      border = true,
      roleDescription = "Toolbar",
      orientation = "horizontal",
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      role="toolbar"
      aria-roledescription={roleDescription}
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="toolbar"
      className={cn(toolbarVariants({ justify, variant, size, border }), className)}
      {...props}
    />
  ),
);
Toolbar.displayName = "Toolbar";

const toolbarGroupVariants = cva("flex items-center gap-2", {
  variants: {
    gap: {
      sm: "gap-1.5",
      md: "gap-2",
      lg: "gap-3",
    },
    wrap: {
      false: "flex-nowrap",
      true: "flex-wrap gap-y-2",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
    },
  },
  defaultVariants: {
    gap: "md",
    wrap: false,
    align: "center",
  },
});

export interface ToolbarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolbarGroupVariants> {}

const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ className, gap, wrap, align, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toolbarGroupVariants({ gap, wrap, align }), className)}
      data-slot="toolbar-group"
      {...props}
    />
  ),
);
ToolbarGroup.displayName = "ToolbarGroup";

const ToolbarSpacer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} data-slot="toolbar-spacer" {...props} />
  ),
);
ToolbarSpacer.displayName = "ToolbarSpacer";

const ToolbarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      className={cn("h-6 w-px bg-border/80", className)}
      data-slot="toolbar-separator"
      {...props}
    />
  ),
);
ToolbarSeparator.displayName = "ToolbarSeparator";

const ToolbarTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-foreground", className)}
      data-slot="toolbar-title"
      {...props}
    />
  ),
);
ToolbarTitle.displayName = "ToolbarTitle";

export {
  Toolbar,
  toolbarVariants,
  ToolbarGroup,
  toolbarGroupVariants,
  ToolbarSpacer,
  ToolbarSeparator,
  ToolbarTitle,
};
