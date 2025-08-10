export async function register() {
  // Sentry server init (per Next.js рекомендациям)
  if (process.env.NODE_ENV === "production") {
    try {
      await import("./sentry.server.config");
    } catch {}
  }
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true" && process.env.NEXT_RUNTIME === "nodejs") {
    const { server } = await import("@/src/mocks/node");
    if (!(globalThis as any).__mswNode) {
      (globalThis as any).__mswNode = true;
      server.listen({ onUnhandledRequest: "bypass" });
      console.info("[MSW-Node] server-side mocks enabled (instrumentation)");
    }
  }
}

// Перехват ошибок запросов (совместимо с modern-setup Sentry)
export function onRequestError(err: unknown) {
  if (process.env.NODE_ENV !== "production") return;
  // динамический импорт, чтобы не тянуть Sentry в dev
  import("@sentry/nextjs")
    .then((Sentry) => {
      const anyS = Sentry as unknown as { captureRequestError?: (e: unknown) => void; captureException?: (e: unknown) => void };
      if (typeof anyS.captureRequestError === "function") anyS.captureRequestError(err);
      else if (typeof anyS.captureException === "function") anyS.captureException(err);
    })
    .catch(() => {});
}


