import { NextRequest, NextResponse } from "next/server";
import { addTeamMember, listTeam } from "@/shared/organizer-profile-store";

export async function GET() {
  return NextResponse.json({ items: listTeam() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const member = addTeamMember({ name: body.name, role: body.role });
  return NextResponse.json(member, { status: 201 });
}


