"use client";

import * as React from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    import("@sentry/nextjs").then((S) => {
      const capture = (S as { captureException?: (e: unknown) => void }).captureException;
      capture?.(error);
    });
  }, [error]);
  return (
    <html>
      <body>
        <div className="p-6">
          <h2 className="text-lg font-semibold">Что-то пошло не так</h2>
          <p className="text-sm text-muted-foreground mt-2">Попробуйте обновить страницу.</p>
        </div>
      </body>
    </html>
  );
}


