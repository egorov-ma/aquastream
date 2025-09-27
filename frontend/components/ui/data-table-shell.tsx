import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toolbar } from "@/components/ui/toolbar";

type DataTableShellProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
};

export function DataTableShell({
  className,
  title,
  description,
  toolbar,
  footer,
  children,
  ...props
}: DataTableShellProps) {
  return (
    <Card data-slot="data-table" className={cn("overflow-hidden", className)} {...props}>
      {(title || description) && (
        <CardHeader className="space-y-1">
          {title ? (
            <CardTitle className="text-base font-semibold leading-tight sm:text-lg">
              {title}
            </CardTitle>
          ) : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      )}
      {toolbar ? (
        <div className="border-t border-border/80 bg-muted/40">
          <Toolbar border={false} className="px-4 sm:px-6">
            {toolbar}
          </Toolbar>
        </div>
      ) : null}
      <CardContent className="p-0">{children}</CardContent>
      {footer ? (
        <CardFooter className="flex flex-wrap items-center gap-3 border-t px-4 py-3 sm:px-6">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}

