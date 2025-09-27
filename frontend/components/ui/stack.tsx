import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      xs: "gap-2",
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    direction: {
      column: "flex-col",
      row: "flex-row",
    },
    align: {
      start: "items-start",
      center: "items-center",
      stretch: "items-stretch",
      end: "items-end",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      between: "justify-between",
      end: "justify-end",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
    },
  },
  defaultVariants: {
    gap: "md",
    direction: "column",
    align: "start",
    justify: "start",
    wrap: "wrap",
  },
});

type StackProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof stackVariants> & {
    asChild?: boolean;
  };

export function Stack({
  className,
  gap,
  direction,
  align,
  justify,
  wrap,
  asChild,
  ...props
}: StackProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(stackVariants({ gap, direction, align, justify, wrap }), className)}
      {...props}
    />
  );
}

