export async function register() {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true" && process.env.NEXT_RUNTIME === "nodejs") {
    const { server } = await import("@/src/mocks/node");
    if (!(globalThis as any).__mswNode) {
      (globalThis as any).__mswNode = true;
      server.listen({ onUnhandledRequest: "bypass" });
      console.info("[MSW-Node] server-side mocks enabled (instrumentation)");
    }
  }
}


