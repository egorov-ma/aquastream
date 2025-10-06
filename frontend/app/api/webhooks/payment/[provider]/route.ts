import { NextRequest, NextResponse } from "next/server";
import { setBookingStatus } from "@/shared/bookings-store";

// In-memory idempotency store for dev stub
const processed = new Set<string>();

type Provider = "yookassa" | "cloudpayments" | "stripe";

function isSupportedProvider(value: string): value is Provider {
  return value === "yookassa" || value === "cloudpayments" || value === "stripe";
}

type YooPayload = { object?: { metadata?: { bookingId?: string }; status?: string } };
type CloudPayload = { Data?: { bookingId?: string }; Status?: string };
type StripePayload = { data?: { object?: { metadata?: { bookingId?: string } } }; type?: string };

function mapPayloadToUpdate(provider: Provider, payload: unknown): { bookingId: string; status: "paid" | "canceled" } | null {
  // Very naive mapper for dev
  switch (provider) {
    case "yookassa":
      // expect { object: { metadata: { bookingId }, status } }
      const y = payload as YooPayload;
      return y?.object?.metadata?.bookingId
        ? { bookingId: String(y.object.metadata.bookingId), status: y?.object?.status === "succeeded" ? "paid" : "canceled" }
        : null;
    case "cloudpayments":
      // expect { Data: { bookingId }, Status: "Completed" | "Canceled" }
      const c = payload as CloudPayload;
      return c?.Data?.bookingId
        ? { bookingId: String(c.Data.bookingId), status: c?.Status === "Completed" ? "paid" : "canceled" }
        : null;
    case "stripe":
      // expect { data: { object: { metadata: { bookingId } } }, type }
      const s = payload as StripePayload;
      return s?.data?.object?.metadata?.bookingId
        ? { bookingId: String(s.data.object.metadata.bookingId), status: s?.type === "checkout.session.completed" ? "paid" : "canceled" }
        : null;
    default:
      return null;
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (!isSupportedProvider(provider)) {
    return NextResponse.json({ ok: false, error: "unsupported_provider" }, { status: 400 });
  }
  const payload = await req.json().catch(() => ({}));
  if (process.env.NODE_ENV !== "production") {
    console.log("[webhook:dev]", provider, payload);
  }

  // Idempotency key
  const key = (req.headers.get("x-event-id") || payload?.eventId || payload?.id || `${provider}:${Date.now()}`) as string;
  if (processed.has(key)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const update = mapPayloadToUpdate(provider, payload);
  if (!update) return NextResponse.json({ ok: false, error: "bad_payload" }, { status: 400 });

  processed.add(key);
  setBookingStatus(update.bookingId, update.status);
  return NextResponse.json({ ok: true });
}

