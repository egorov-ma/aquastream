"use client";

import { useEffect } from "react";

export function MswProvider() {
  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
    if (!isDev || !useMocks) return;

    import("@/src/mocks/browser").then(({ worker }) => {
      worker
        .start({ serviceWorker: { url: "/mockServiceWorker.js" } })
        .then(() => console.info("[MSW] development mocks enabled"))
        .catch((e) => console.warn("[MSW] failed to start:", e));
    });
  }, []);

  return null;
}


