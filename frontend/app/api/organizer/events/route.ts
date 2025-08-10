import { NextRequest, NextResponse } from "next/server";
import { createEvent, listEvents } from "@/shared/organizer-events-store";

export async function GET() {
  return NextResponse.json({ items: listEvents() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const evt = createEvent({
    title: body.title,
    dateStart: body.dateStart,
    dateEnd: body.dateEnd ?? null,
    location: body.location ?? null,
    price: body.price ?? null,
    capacity: body.capacity ?? null,
    description: body.description ?? null,
  });
  return NextResponse.json(evt, { status: 201 });
}


