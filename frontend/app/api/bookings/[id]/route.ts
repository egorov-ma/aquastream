import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // Мок-данные брони
  return NextResponse.json({
    id,
    event: { id: "ev-101", title: "Заплыв по утренней Неве" },
    amount: 2000,
    status: "pending",
  });
}


