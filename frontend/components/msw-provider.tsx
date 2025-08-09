"use client";

import { useEffect } from "react";

export function MswProvider() {
  useEffect(() => {
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
    if (!useMocks) return;

    import("@/src/mocks/browser").then(({ worker }) => {
      worker
        .start({
          serviceWorker: { url: "/mockServiceWorker.js" },
          onUnhandledRequest: "bypass",
        })
        .then(() => {
          window.__mswReady = true;
          window.dispatchEvent(new Event("msw-ready"));
          console.info("[MSW] development mocks enabled");
        })
        .catch((e) => console.warn("[MSW] failed to start:", e));
    });
  }, []);

  return null;
}


