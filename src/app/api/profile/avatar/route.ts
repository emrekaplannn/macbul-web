import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => { if (DEBUG) console.debug("[PROFILE:avatar]", ...a); };

// Güvenli fetch helper
async function fetchJSON<T>(url: string, init?: RequestInit) {
  const t0 = DEBUG ? performance.now() : 0;
  let res: Response;
  try {
    res = await fetch(url, { ...init, cache: "no-store" });
  } catch (e) {
    return { res: null as any, data: null as any, took: 0, error: e };
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  const took = DEBUG ? Math.round(performance.now() - t0) : 0;
  return { res, data: data as T, took, error: null };
}

export async function GET() {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json({ url: null }, { status: 200 });
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

  const url = `${base}/v1/profile/avatar`;
  const { res, data, took, error } = await fetchJSON(url, { headers: fwdHeaders });

  // Backend çağrısı çöktüyse
  if (error || !res) {
    log("avatar fetch failed", { error });
    return NextResponse.json({ url: null }, { status: 200 });
  }

  // Log
  log("avatar", {
    status: res.status,
    ok: res.ok,
    took_ms: took,
    response: data,
  });

  // ⭐ ANA KURAL ⭐
  // Backend ne dönerse dönsün: FE her zaman güvenli JSON almalı
  if (!res.ok) {
    return NextResponse.json({ url: null }, { status: 200 });
  }

  // Backend başarılı ise (url olabilir ya da olmayabilir)
  return NextResponse.json(
    { url: data?.url ?? null },
    { status: 200 }
  );
}
