import { NextRequest, NextResponse } from "next/server";
import { addFaqItem, listFaq } from "@/shared/organizer-profile-store";

export async function GET() {
  return NextResponse.json({ items: listFaq() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = addFaqItem({ question: body.question, answer: body.answer });
  return NextResponse.json(item, { status: 201 });
}


