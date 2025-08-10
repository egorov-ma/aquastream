import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) return NextResponse.redirect(new URL("/login?error=oauth_missing_code", req.url));

  try {
    // Обмен кода на токен (dev: заглушка)
    // В реале: fetch(process.env.OAUTH2_TOKEN_URL!, { method: 'POST', body: ...client_id/secret/code/redirect_uri })
    const role = state === "admin" ? "admin" : state === "organizer" ? "organizer" : "user";

    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set({ name: "sid", value: `oauth_${code}`, httpOnly: true, sameSite: "lax", secure: true, path: "/" });
    // Сделаем role доступной на клиенте для UI-скрытия (не HttpOnly)
    res.cookies.set({ name: "role", value: role, httpOnly: false, sameSite: "lax", secure: true, path: "/" });
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_exchange_failed", req.url));
  }
}


