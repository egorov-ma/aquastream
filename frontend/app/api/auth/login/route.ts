import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password, role: roleFromBody } = (await request.json()) as { username?: string; password?: string; role?: "user" | "organizer" | "admin" };
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // dev‑валидация: для примера считаем, что любой непустой input валиден
    // роль выводим из username (admin|organizer|user) для совместимости с middleware
    const role = roleFromBody ?? (username === "admin" ? "admin" : username === "organizer" ? "organizer" : "user");
    const token = `dev.${Buffer.from(`${username}:${Date.now()}`).toString("base64")}.token`;

    const res = NextResponse.json({ token, user: { id: 1, username } }, { status: 200 });
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set({ name: "sid", value: token, httpOnly: true, sameSite: "lax", secure, path: "/" });
    res.cookies.set({ name: "role", value: role, httpOnly: false, sameSite: "lax", secure, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}


