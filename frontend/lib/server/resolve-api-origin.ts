import { headers } from "next/headers";

export function resolveApiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base && base.trim().length > 0) {
    return base.replace(/\/$/, "");
  }
  const incoming = headers();
  const host = incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}
