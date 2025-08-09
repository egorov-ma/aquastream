import { NextResponse } from "next/server";

let profile = {
  phone: "+7 (999) 123-45-67",
  telegram: "@aquaswimmer",
  extra: "",
  verified: false,
};

export async function GET() {
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json();
  profile = {
    phone: body.phone ?? profile.phone,
    telegram: body.telegram ?? profile.telegram,
    extra: body.extra ?? profile.extra,
    verified: Boolean(body.verified ?? profile.verified),
  };
  return NextResponse.json(profile);
}


