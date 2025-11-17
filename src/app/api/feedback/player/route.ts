// app/api/feedback/player/route.ts
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => {
  if (DEBUG) console.debug("[FEEDBACK:player]", ...a);
};

async function fetchJSON<T>(url: string, init?: RequestInit) {
  const t0 = DEBUG ? performance.now() : 0;
  const res = await fetch(url, { ...init, cache: "no-store" });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // JSON değilse boş bırakıyoruz
  }

  const took = DEBUG ? Math.round(performance.now() - t0) : 0;
  return { res, data: data as T, took };
}

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { ok: false, message: "NO_API_BASE_URL" },
      { status: 500 }
    );
  }

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

  // Frontend'den gelen JSON string'ini aynen forward edelim
  const body = await req.text(); // { matchId, targetId, overallRating, comment? }

  const url = `${base}/v1/match-player-feedback`;

  const { res: bRes, data, took } = await fetchJSON<any>(url, {
    method: "POST",
    headers: fwdHeaders,
    body,
  });

  log("player-feedback", {
    status: bRes.status,
    ok: bRes.ok,
    took_ms: took,
    backendBody: data,
  });

  return NextResponse.json(data, { status: bRes.status });
}
