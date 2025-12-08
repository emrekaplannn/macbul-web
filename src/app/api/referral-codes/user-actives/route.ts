// app/api/referral-codes/user-actives/route.ts
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => DEBUG && console.debug("[REF-CODE]", ...a);

export async function GET() {
  const API_BASE = process.env.API_BASE_URL;
  if (!API_BASE) {
    return NextResponse.json({ message: "NO_API_BASE_URL" }, { status: 500 });
  }

  const h = await headers();
  const c = await cookies();

  const incomingCookie = h.get("cookie") ?? "";
  const authHeader = h.get("authorization") ?? "";

  const accessCookie = c.get("access_token")?.value;
  const auth = authHeader || (accessCookie ? `Bearer ${accessCookie}` : "");

  const fwdHeaders: HeadersInit = {
    ...(incomingCookie ? { cookie: incomingCookie } : {}),
    ...(auth ? { Authorization: auth } : {}),
  };

  const url = `${API_BASE}/v1/referral-codes/user-actives`;

  const t0 = performance.now();
  const res = await fetch(url, { headers: fwdHeaders, cache: "no-store" });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  const took = Math.round(performance.now() - t0);

  log("active-ref", { status: res.status, ok: res.ok, took_ms: took, data });

  return NextResponse.json(data, { status: res.status });
}
