import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sectionVariants = cva("grid", {
  variants: {
    gap: {
      none: "",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    },
    padding: {
      none: "",
      xs: "p-2",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-12",
    },
    paddingX: {
      none: "",
      xs: "px-2",
      sm: "px-4",
      md: "px-6",
      lg: "px-8",
      xl: "px-12",
    },
    paddingY: {
      none: "",
      xs: "py-2",
      sm: "py-4",
      md: "py-6",
      lg: "py-8",
      xl: "py-12",
    },
    width: {
      none: "",
      xs: "mx-auto w-full max-w-xs",
      sm: "mx-auto w-full max-w-sm",
      md: "mx-auto w-full max-w-md",
      lg: "mx-auto w-full max-w-lg",
      xl: "mx-auto w-full max-w-xl",
      "2xl": "mx-auto w-full max-w-2xl",
      "3xl": "mx-auto w-full max-w-3xl",
      "4xl": "mx-auto w-full max-w-4xl",
      "5xl": "mx-auto w-full max-w-5xl",
      "6xl": "mx-auto w-full max-w-6xl",
      "7xl": "mx-auto w-full max-w-7xl",
      full: "w-full",
    },
    align: {
      start: "text-left",
      center: "text-center",
      end: "text-right",
    },
  },
  defaultVariants: {
    gap: "md",
    padding: "none",
    paddingX: "none",
    paddingY: "none",
    width: "none",
    align: "start",
  },
})

const Section = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof sectionVariants> & {
    asChild?: boolean
  }
>(({ className, gap, padding, paddingX, paddingY, width, align, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "section"
  return (
    <Comp
      ref={ref}
      className={cn(sectionVariants({ gap, padding, paddingX, paddingY, width, align }), className)}
      {...props}
    />
  )
})
Section.displayName = "Section"

export { Section, sectionVariants }

