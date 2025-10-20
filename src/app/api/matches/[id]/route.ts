// app/api/matches/[id]/route.ts
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic"; // cache yok

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => { if (DEBUG) console.debug("[DETAIL]", ...a); };

// ---- DTO'lar
type MatchDto = {
  id: string; organizerId: string; fieldName: string; address: string;
  city: string; matchTimestamp: number; pricePerUser: string | number;
  totalSlots: number; createdAt: number;
};
type MatchSlotsDto = {
  matchId: string; totalSlots: number; paidCount: number; remaining: number; full: boolean;
};
type MatchParticipantDto = {
  id: string; matchId: string; userId: string; teamId?: string | null;
  joinedAt?: number | null; hasPaid: boolean;
};
type DetailPayload = {
  ok: boolean; match: MatchDto; slots: MatchSlotsDto; participants: MatchParticipantDto[];
};

async function fetchJSON<T>(url: string, init?: RequestInit) {
  const t0 = DEBUG ? performance.now() : 0;
  const res = await fetch(url, { ...init, cache: "no-store" });
  let data: any = {};
  try { data = await res.json(); } catch { /* metin de olabilir */ }
  const took = DEBUG ? Math.round(performance.now() - t0) : 0;
  return { res, data: data as T, took };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // Next 15: await params
) {
  const base = process.env.API_BASE_URL; // wallet/join ile aynı env
  const h = await headers();
  const c = await cookies();

  const { id } = await ctx.params;

  log("start", { id, base: base ? "(present)" : "(missing)" });

  if (!base) {
    return NextResponse.json({ ok: false, message: "NO_API_BASE_URL" }, { status: 500 });
  }

  // auth: header > cookie(access_token)
  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieToken = c.get("access_token")?.value;
  const auth = hdrAuth || (cookieToken ? `Bearer ${cookieToken}` : "");

  log("auth", {
    hasAuth: !!auth,
    hasCookieHeader: !!incomingCookie,
    hasAccessTokenCookie: !!cookieToken,
  });

  // Tüm çağrılarda aynı ileri başlıklar
  const fwdHeaders: HeadersInit = {
    ...(incomingCookie ? { cookie: incomingCookie } : {}),
    ...(auth ? { Authorization: auth } : {}),
  };

  // 1) Match
  const mUrl = `${base}/v1/matches/${id}`;
  const { res: mRes, data: match, took: mTook } = await fetchJSON<MatchDto>(mUrl, { headers: fwdHeaders });
  log("fetch:match", { status: mRes.status, ok: mRes.ok, took_ms: mTook });
  if (!mRes.ok || !match?.id) {
    const msg = (match as any)?.message || "Match not found";
    return NextResponse.json({ ok: false, message: msg }, { status: mRes.status || 404 });
  }

  // 2) Slots
  const sUrl = `${base}/v1/matches/${id}/slots`;
  const { res: sRes, data: slots, took: sTook } = await fetchJSON<MatchSlotsDto>(sUrl, { headers: fwdHeaders });
  log("fetch:slots", { status: sRes.status, ok: sRes.ok, took_ms: sTook });
  if (!sRes.ok || !slots?.matchId) {
    const msg = (slots as any)?.message || "Slots not found";
    return NextResponse.json({ ok: false, message: msg }, { status: sRes.status || 404 });
  }

  // 3) Participants — auth gerektirebilir; 401 ise boş diziye düş (UI kırılmasın)
  const pUrl = `${base}/v1/match-participants/match/${id}`;
  const { res: pRes, data: parts, took: pTook } =
    await fetchJSON<MatchParticipantDto[] | { message?: string }>(pUrl, { headers: fwdHeaders });
  log("fetch:participants", { status: pRes.status, ok: pRes.ok, took_ms: pTook });

  const participants: MatchParticipantDto[] =
    pRes.ok && Array.isArray(parts) ? parts : [];

  if (!pRes.ok && pRes.status !== 401) {
    const msg = (parts as any)?.message || "Participants fetch failed";
    return NextResponse.json({ ok: false, message: msg }, { status: pRes.status || 400 });
  }

  log("success", { id, participants: participants.length });

  const body: DetailPayload = { ok: true, match, slots, participants };
  return NextResponse.json(body, { status: 200 });
}
