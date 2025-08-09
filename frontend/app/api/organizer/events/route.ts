import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    items: [
      { id: "e1", title: "SUP Sunset", date: new Date().toISOString(), price: 1800, capacity: 20 },
      { id: "e2", title: "Kayak Weekend", date: new Date(Date.now() + 86400000).toISOString(), price: 2500, capacity: 12 },
    ],
  });
}


