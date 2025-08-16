import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <Alert className="text-center">
      <AlertDescription>
        <div>{title}</div>
        {action ? <div className="mt-3">{action}</div> : null}
      </AlertDescription>
    </Alert>
  );
}

export function ErrorState({ message = "Произошла ошибка", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <Alert variant="destructive" className="text-center">
      <AlertDescription>
        <div>{message}</div>
        {onRetry ? (
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={onRetry}>Повторить</Button>
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}


