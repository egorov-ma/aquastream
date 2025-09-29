import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loadingStateVariants = cva("grid", {
  variants: {
    size: {
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-3",
    },
    lines: {
      "1": "[&>*:nth-child(n+2)]:hidden",
      "2": "[&>*:nth-child(n+3)]:hidden",
      "3": "",
    },
  },
  defaultVariants: {
    size: "md",
    lines: "3",
  },
})

interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingStateVariants> {}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, size, lines, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(loadingStateVariants({ size, lines }), className)}
      {...props}
    >
      <Skeleton className="h-6 w-[40%]" />
      <Skeleton className="h-4 w-[70%]" />
      <Skeleton className="h-4 w-[50%]" />
    </div>
  )
)
LoadingState.displayName = "LoadingState"

const emptyStateVariants = cva("text-center", {
  variants: {
    variant: {
      default: "",
      card: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant, title = "No data", description, action, ...props }, ref) => (
    <Alert ref={ref} className={cn(emptyStateVariants({ variant }), className)} {...props}>
      <AlertDescription>
        <div className="font-medium">{title}</div>
        {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        {action && <div className="mt-3">{action}</div>}
      </AlertDescription>
    </Alert>
  )
)
EmptyState.displayName = "EmptyState"

const errorStateVariants = cva("text-center", {
  variants: {
    variant: {
      default: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      outline: "border-destructive text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface ErrorStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorStateVariants> {
  message?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({
    className,
    variant,
    message = "An error occurred",
    description,
    onRetry,
    retryLabel = "Retry",
    ...props
  }, ref) => (
    <Alert
      ref={ref}
      variant="destructive"
      className={cn(errorStateVariants({ variant }), className)}
      {...props}
    >
      <AlertDescription>
        <div className="font-medium">{message}</div>
        {description && <div className="mt-1 text-sm">{description}</div>}
        {onRetry && (
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
)
ErrorState.displayName = "ErrorState"

export {
  LoadingState,
  loadingStateVariants,
  EmptyState,
  emptyStateVariants,
  ErrorState,
  errorStateVariants,
}


