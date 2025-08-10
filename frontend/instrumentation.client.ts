// Modern Sentry client initialization via App Router instrumentation
export async function register() {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const Sentry = await import("@sentry/nextjs");
  const anyS = Sentry as any;
  // Prevent double init in fast refresh
  if (anyS.__AQUA_SENTRY_INIT__) return;
  anyS.__AQUA_SENTRY_INIT__ = true;

  anyS.init?.({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 0.1,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV || "production",
  });
}


