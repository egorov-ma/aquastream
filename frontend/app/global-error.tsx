"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }
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


