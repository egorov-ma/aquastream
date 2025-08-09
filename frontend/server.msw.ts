// Next.js custom entry for enabling MSW Node in dev server side
import { server } from "@/src/mocks/node";

if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
  server.listen({ onUnhandledRequest: "bypass" });
  console.info("[MSW-Node] server-side mocks enabled");
}


