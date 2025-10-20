// app/api/matches/[id]/join/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

type MatchParticipantDto = {
  id: string;
  matchId: string;
  userId: string;
  teamId?: string | null;
  joinedAt?: number | null;
  hasPaid: boolean;
};
type JoinResponse = { ok: boolean; participant?: MatchParticipantDto | null; message?: string };

export const dynamic = "force-dynamic";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => { if (DEBUG) console.debug("[JOIN]", ...a); };

function mask(s?: string | null, keep = 6) {
  if (!s) return "<none>";
  return s.slice(0, keep) + `…(len=${s.length})`;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // Next 15+: await params
) {
  const base = process.env.API_BASE_URL;
  const h = await headers();
  const c = await cookies();

  const { id } = await ctx.params.catch((e) => {
    log("params:await:error", e?.message || e);
    return { id: undefined as unknown as string };
  });

  // 0) ENV/param doğrulama
  log("env", { NODE_ENV: process.env.NODE_ENV, API_BASE_URL: base || "<missing>" });
  log("params", { id });

  if (!base) {
    log("fail:no-base-url");
    return NextResponse.json({ ok: false, message: "NO_API_BASE_URL" } as JoinResponse, { status: 500 });
  }
  if (!id) {
    log("fail:no-id");
    return NextResponse.json({ ok: false, message: "Bad request: id is missing" } as JoinResponse, { status: 400 });
  }

  // 1) Auth oluştur
  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieToken = c.get("access_token")?.value;
  const auth = hdrAuth || (cookieToken ? `Bearer ${cookieToken}` : "");

  log("auth", {
    hasAuth: !!auth,
    hdrAuth: mask(hdrAuth),
    cookieToken: mask(cookieToken, 12),
    forwardCookie: incomingCookie ? "(present)" : "(none)",
  });

  if (!auth) {
    log("fail:no-auth");
    return NextResponse.json(
      { ok: false, message: "Yetkisiz: access token yok." } as JoinResponse,
      { status: 401 }
    );
  }

  // 2) Body hazırla (id’yi zorunlu olarak matchId’ye koy)
  const incoming = await req.json().catch(() => ({} as any));
  const bodyObj = { ...incoming, matchId: id };
  const bodyStr = JSON.stringify(bodyObj);
  log("body", {
    keys: Object.keys(bodyObj),
    matchId: bodyObj.matchId,
    teamId: bodyObj.teamId ?? null,
    hasPaid: bodyObj.hasPaid ?? null,
    byteLen: Buffer.byteLength(bodyStr, "utf8"),
    preview: bodyStr.length > 200 ? bodyStr.slice(0, 200) + "…" : bodyStr,
  });

  // 3) Backend isteği
  const url = `${base}/v1/match-participants`;
  const fwdHeaders: HeadersInit = {
    cookie: incomingCookie,
    Authorization: auth,
    "Content-Type": "application/json",
  };

  log("request", { url, method: "POST", headers: { cookie: "(present)", Authorization: "(present)", "Content-Type": "application/json" } });

  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: fwdHeaders, body: bodyStr, cache: "no-store" });
  } catch (e: any) {
    log("fetch:error", { msg: e?.message || String(e) });
    return NextResponse.json({ ok: false, message: "Upstream fetch failed" } as JoinResponse, { status: 502 });
  }

  // 4) Yanıt header/ gövde tanılama
  const respHeaders = {
    "www-authenticate": res.headers.get("www-authenticate"),
    "content-type": res.headers.get("content-type"),
    "set-cookie": res.headers.get("set-cookie"),
    vary: res.headers.get("vary"),
  };
  log("response:headers", respHeaders);

  let data: any = null;
  let text = "";
  let isJSON = false;
  try { data = await res.clone().json(); isJSON = true; } catch { text = await res.text().catch(() => ""); }

  log("response:body", {
    status: res.status,
    ok: res.ok,
    isJSON,
    jsonKeys: isJSON && data && typeof data === "object" ? Object.keys(data) : undefined,
    textPreview: !isJSON ? (text ? (text.length > 200 ? text.slice(0, 200) + "…" : text) : "<empty>") : undefined,
  });

  // 5) Başarısızsa anlamlı mesajla dön
  if (!res.ok || !isJSON || !data?.id) {
    const message =
      (isJSON && data && typeof data === "object" && "message" in data && data.message) ||
      (text || `Join failed (${res.status})`);

    log("join:fail", { status: res.status, message, hasIdField: !!(isJSON && data?.id) });
    return NextResponse.json({ ok: false, message } as JoinResponse, { status: res.status || 400 });
  }

  // 6) Başarılı
  log("join:success", { participantId: data.id, matchId: data.matchId, userId: data.userId });
  return NextResponse.json({ ok: true, participant: data as MatchParticipantDto } as JoinResponse, { status: 200 });
}
