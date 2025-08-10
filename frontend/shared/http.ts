export type Ok<T> = { ok: true; data: T; status: number };
export type Err = { ok: false; error: string; status: number };
export type Result<T> = Ok<T> | Err;

function resolveOrigin() {
  const port = process.env.PORT ?? "3000";
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? `http://localhost:${port}`;
}

export async function serverFetch<T>(path: string | URL, init?: RequestInit & { timeoutMs?: number }): Promise<Result<T>> {
  const origin = resolveOrigin();
  const url = path instanceof URL ? path : new URL(String(path), origin);
  const controller = new AbortController();
  const id = init?.timeoutMs ? setTimeout(() => controller.abort(), init!.timeoutMs) : undefined;
  try {
    const res = await fetch(url, { ...init, signal: init?.signal ?? controller.signal });
    const status = res.status;
    const text = await res.text();
    try {
      const json = (text ? JSON.parse(text) : undefined) as T;
      if (!res.ok) return { ok: false, error: (json as unknown as { error?: string })?.error ?? res.statusText, status };
      return { ok: true, data: json, status };
    } catch {
      if (!res.ok) return { ok: false, error: res.statusText, status };
      return { ok: true, data: (text as unknown as T), status };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg, status: 0 };
  } finally {
    if (id) clearTimeout(id);
  }
}


