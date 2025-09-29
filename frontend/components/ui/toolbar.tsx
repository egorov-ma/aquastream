"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toolbarVariants = cva("flex items-center py-2 sm:py-3", {
  variants: {
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    gap: {
      sm: "gap-1 sm:gap-2",
      md: "gap-2 sm:gap-3",
      lg: "gap-3 sm:gap-4",
    },
    border: {
      true: "border-b",
      false: "",
    },
  },
  defaultVariants: {
    justify: "between",
    gap: "md",
    border: true,
  },
})

interface ToolbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolbarVariants> {}

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, justify, gap, border = true, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="toolbar"
      className={cn(toolbarVariants({ justify, gap, border }), className)}
      {...props}
    />
  )
)
Toolbar.displayName = "Toolbar"

const toolbarGroupVariants = cva("flex items-center", {
  variants: {
    gap: {
      sm: "gap-1 sm:gap-2",
      md: "gap-2 sm:gap-3",
      lg: "gap-3 sm:gap-4",
    },
  },
  defaultVariants: {
    gap: "md",
  },
})

interface ToolbarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolbarGroupVariants> {}

const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ className, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toolbarGroupVariants({ gap }), className)}
      {...props}
    />
  )
)
ToolbarGroup.displayName = "ToolbarGroup"

const ToolbarSpacer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props} />
  )
)
ToolbarSpacer.displayName = "ToolbarSpacer"

export {
  Toolbar,
  toolbarVariants,
  ToolbarGroup,
  toolbarGroupVariants,
  ToolbarSpacer,
}

