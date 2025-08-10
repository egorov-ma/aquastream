import { NextRequest, NextResponse } from "next/server";
import { getBrand, setBrand } from "@/shared/organizer-profile-store";

export async function GET() {
  return NextResponse.json(getBrand());
}

export async function PATCH(req: NextRequest) {
  const patch = await req.json();
  return NextResponse.json(setBrand(patch));
}


