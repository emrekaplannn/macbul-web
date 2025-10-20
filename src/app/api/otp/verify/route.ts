// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => { if (DEBUG) console.debug("[OTP:verify]", ...a); };

async function fetchJSON<T>(url: string, init?: RequestInit) {
  const t0 = DEBUG ? performance.now() : 0;
  const res = await fetch(url, { ...init, cache: "no-store" });
  let data: any = {};
  try { data = await res.json(); } catch {}
  const took = DEBUG ? Math.round(performance.now() - t0) : 0;
  return { res, data: data as T, took };
}

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) return NextResponse.json({ ok: false, message: "NO_API_BASE_URL" }, { status: 500 });

  const h = await headers();
  const c = await cookies();

  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieToken = c.get("access_token")?.value;
  const auth = hdrAuth || (cookieToken ? `Bearer ${cookieToken}` : "");

  const fwdHeaders: HeadersInit = {
    "content-type": "application/json",
    ...(incomingCookie ? { cookie: incomingCookie } : {}),
    ...(auth ? { Authorization: auth } : {}),
  };

  const body = await req.text(); // { type: "EMAIL_VERIFY", code: "123456" }

  const url = `${base}/v1/otp/verify`;
  const { res: bRes, data, took } = await fetchJSON<any>(url, { method: "POST", headers: fwdHeaders, body });
  log("verify", { status: bRes.status, ok: bRes.ok, took_ms: took });
  return NextResponse.json(data, { status: bRes.status });
}
