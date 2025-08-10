import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("grid gap-4", className)} {...props} />;
}


