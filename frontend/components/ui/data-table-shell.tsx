import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Toolbar } from "@/components/ui/toolbar"

const dataTableShellVariants = cva("overflow-hidden", {
  variants: {
    variant: {
      default: "",
      outline: "border-2",
      ghost: "border-none shadow-none",
    },
    size: {
      default: "",
      sm: "[&_[data-slot=data-table-header]]:px-4 [&_[data-slot=data-table-header]]:py-3",
      lg: "[&_[data-slot=data-table-header]]:px-8 [&_[data-slot=data-table-header]]:py-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

interface DataTableShellProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof dataTableShellVariants> {
  title?: React.ReactNode
  description?: React.ReactNode
  toolbar?: React.ReactNode
  footer?: React.ReactNode
}

const DataTableShell = React.forwardRef<HTMLDivElement, DataTableShellProps>(
  ({ className, variant, size, title, description, toolbar, footer, children, ...props }, ref) => (
    <Card
      ref={ref}
      data-slot="data-table"
      className={cn(dataTableShellVariants({ variant, size }), className)}
      {...props}
    >
      {(title || description) && (
        <CardHeader data-slot="data-table-header" className="space-y-1">
          {title && (
            <CardTitle className="text-base font-semibold leading-tight sm:text-lg">
              {title}
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      {toolbar && (
        <div className="border-t border-border/80 bg-muted/40">
          <Toolbar border={false} className="px-4 sm:px-6">
            {toolbar}
          </Toolbar>
        </div>
      )}
      <CardContent className="p-0">{children}</CardContent>
      {footer && (
        <CardFooter className="flex flex-wrap items-center gap-3 border-t px-4 py-3 sm:px-6">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
)
DataTableShell.displayName = "DataTableShell"

export { DataTableShell, dataTableShellVariants }

