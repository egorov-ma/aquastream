import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function LoadingState() {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-6 w-[40%]" />
      <Skeleton className="h-4 w-[70%]" />
      <Skeleton className="h-4 w-[50%]" />
    </div>
  );
}

export function EmptyState({ title = "Нет данных", action }: { title?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
      <div>{title}</div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message = "Произошла ошибка", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-md border p-6 text-center">
      <div className="text-sm text-destructive">{message}</div>
      {onRetry ? (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onRetry}>Повторить</Button>
        </div>
      ) : null}
    </div>
  );
}


