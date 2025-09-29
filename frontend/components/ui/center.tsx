import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const centerVariants = cva(
  "flex min-h-svh w-full items-center justify-center",
  {
    variants: {
      maxWidth: {
        none: "",
        xs: "[&>*]:w-full [&>*]:max-w-xs",
        sm: "[&>*]:w-full [&>*]:max-w-sm",
        md: "[&>*]:w-full [&>*]:max-w-md",
        lg: "[&>*]:w-full [&>*]:max-w-lg",
        xl: "[&>*]:w-full [&>*]:max-w-xl",
        "2xl": "[&>*]:w-full [&>*]:max-w-2xl",
      },
      padding: {
        none: "",
        sm: "p-4 md:p-6",
        md: "p-6 md:p-10",
        lg: "p-8 md:p-12",
      },
    },
    defaultVariants: {
      maxWidth: "sm",
      padding: "md",
    },
  }
)

const Center = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof centerVariants>
>(({ className, maxWidth, padding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(centerVariants({ maxWidth, padding }), className)}
    {...props}
  />
))
Center.displayName = "Center"

export { Center, centerVariants }