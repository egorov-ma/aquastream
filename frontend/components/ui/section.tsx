import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sectionVariants = cva("grid", {
  variants: {
    gap: {
      xs: "gap-2",
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    padding: {
      none: "",
      sm: "py-4",
      md: "py-6",
      lg: "py-8",
      xl: "py-12",
    },
    width: {
      none: "",
      narrow: "mx-auto w-full max-w-sm",
      normal: "mx-auto w-full max-w-3xl",
      wide: "mx-auto w-full max-w-5xl",
      xl: "mx-auto w-full max-w-6xl",
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
    width: "none",
    align: "start",
  },
});

type SectionProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
    asChild?: boolean;
  };

export function Section({
  className,
  gap,
  padding,
  width,
  align,
  asChild,
  ...props
}: SectionProps) {
  const Comp = asChild ? Slot : "section";
  return (
    <Comp className={cn(sectionVariants({ gap, padding, width, align }), className)} {...props} />
  );
}

