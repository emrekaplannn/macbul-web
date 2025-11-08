import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => { if (DEBUG) console.debug("[PROFILE:avatar]", ...a); };

async function fetchJSON<T>(url: string, init?: RequestInit) {
  const t0 = DEBUG ? performance.now() : 0;
  const res = await fetch(url, { ...init, cache: "no-store" });
  let data: any = {};
  try { data = await res.json(); } catch {}
  const took = DEBUG ? Math.round(performance.now() - t0) : 0;
  return { res, data: data as T, took };
}

export async function GET() {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json({ ok: false, message: "NO_API_BASE_URL" }, { status: 500 });
  }

  const h = await headers();
  const c = await cookies();

  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieToken = c.get("access_token")?.value;
  const auth = hdrAuth || (cookieToken ? `Bearer ${cookieToken}` : "");

  const fwdHeaders: HeadersInit = {
    ...(incomingCookie ? { cookie: incomingCookie } : {}),
    ...(auth ? { Authorization: auth } : {}),
  };

  // 🔹 Backend endpoint
  const url = `${base}/v1/profile/avatar`;
  const { res: bRes, data, took } = await fetchJSON<any>(url, { headers: fwdHeaders });

  // 🔹 Log: status + süre + response içeriği
  log("avatar", {
    status: bRes.status,
    ok: bRes.ok,
    took_ms: took,
    response: data, // <--- burada içerik loglanıyor
  });

  return NextResponse.json(data, { status: bRes.status });
}
