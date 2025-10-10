import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

/**
 * /api/matches
 * Akış:
 * 1) Backend'e /v1/auth/login (email+password) -> access token al
 * 2) Authorization: Bearer <token> ile /v1/matches/list-filtered çağır
 *
 * Not: email/password sabitleri ENV ile override edilebilir.
 */

const LOGIN_EMAIL  = process.env.LOGIN_EMAIL  || "mranewliz@gmail.com";
const LOGIN_PASS   = process.env.LOGIN_PASS   || "1547mrmrmr";
const LOGIN_PATH   = "/v1/auth/login";
const MATCHES_PATH = "/v1/matches/list-filtered";

type MaybeToken =
  | { accessToken?: string; token?: string; jwt?: string; idToken?: string; access_token?: string; id_token?: string }
  | { data?: { accessToken?: string; token?: string; jwt?: string; idToken?: string; access_token?: string; id_token?: string } }
  | any;

function extractToken(obj: MaybeToken): string | null {
  if (!obj || typeof obj !== "object") return null;
  const direct =
    obj.accessToken || obj.access_token ||
    obj.token || obj.jwt ||
    obj.idToken || obj.id_token;
  if (direct) return String(direct);
  const data = (obj as any).data || {};
  return (
    data.accessToken || data.access_token ||
    data.token || data.jwt ||
    data.idToken || data.id_token || null
  );
}

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL;
  const t0 = Date.now();

  // İstek gövdesi (sadece fromTimestamp kullanıyoruz)
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const now = Date.now();
  const payload = {
    fromTimestamp: typeof body.fromTimestamp === "number" ? body.fromTimestamp : now,
  };

  const headerStore = await headers();
  const cookieStore = await cookies();

  const incomingCookieHeader = headerStore.get("cookie") ?? "";

  // Teşhis: ortam bilgisi
  console.log("[/api/matches] start", {
    envHasBase: Boolean(base),
    payload,
    cookieLen: incomingCookieHeader.length,
    at: new Date().toISOString(),
  });

  if (!base) {
    console.warn("[/api/matches] API_BASE_URL yok; boş liste döndü.");
    return NextResponse.json({ ok: true, items: [], debug: { reason: "NO_API_BASE_URL" } });
  }

  // 1) LOGIN
  const loginUrl = `${base}${LOGIN_PATH}`;
  try {
    const loginRes = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Bazı backend'ler cookie tabanlı oturumu da set edebilir; sorun yok.
      body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASS }),
      cache: "no-store",
    });

    const loginText = await loginRes.text().catch(() => "");
    let loginJson: any = {};
    try { loginJson = JSON.parse(loginText); } catch { loginJson = { raw: loginText }; }

    if (!loginRes.ok) {
      console.error("[/api/matches] login !ok", { status: loginRes.status, url: loginUrl, body: loginJson });
      return NextResponse.json(
        { ok: false, message: "Login başarısız (401/403). Kimlik doğrulama yapılamadı." },
        { status: loginRes.status }
      );
    }

    const token = extractToken(loginJson);
    if (!token) {
      console.error("[/api/matches] login ok ama token bulunamadı", { sample: Object.keys(loginJson || {}) });
      return NextResponse.json(
        { ok: false, message: "Login yanıtında access token bulunamadı." },
        { status: 500 }
      );
    }

    const tokenMasked = token.length > 8 ? token.slice(0, 4) + "***" + token.slice(-4) : "***";
    console.log("[/api/matches] login ok", { tokenLen: token.length, tokenMasked });

    // 2) MATCHES çağrısı
    const url = `${base}${MATCHES_PATH}`;
    const headersToSend: Record<string, string> = {
      "Content-Type": "application/json",
      cookie: incomingCookieHeader, // varsa ek cookie'leri de taşı
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: headersToSend,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const dur = Date.now() - t0;

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[/api/matches] backend !ok", { status: res.status, durMs: dur, url, text });
      return NextResponse.json(
        { ok: false, message: text || `Liste alınamadı (status ${res.status})` },
        { status: res.status }
      );
    }

    const list: any[] = await res.json().catch((e) => {
      console.error("[/api/matches] json parse error", e);
      return [];
    });

    console.log("[/api/matches] backend ok", {
      durMs: dur,
      url,
      rawCount: Array.isArray(list) ? list.length : -1,
      sample0: Array.isArray(list) && list.length ? list[0] : null,
    });

    // UI map + status
    const items = (list ?? []).map((d) => {
      const ratio = d.totalSlots > 0 ? d.filledSlots / d.totalSlots : 0;
      const status =
        d.filledSlots >= d.totalSlots ? "full" :
        ratio >= 0.75 ? "filling" : "available";

      return {
        id: d.id,
        isoDate: new Date(d.matchTimestamp).toISOString(),
        price: Number(d.pricePerUser ?? 0),
        venueName: d.fieldName,
        city: d.city,
        capacity: d.totalSlots,
        joined: d.filledSlots,
        isUserJoined: Boolean(d.isUserJoined),
        status,
      };
    });

    console.log("[/api/matches] mapped", { mappedCount: items.length });

    return NextResponse.json({
      ok: true,
      items,
      debug: {
        payloadSent: payload,
        backendUrl: url,
        rawCount: Array.isArray(list) ? list.length : -1,
      },
    });

  } catch (err: any) {
    const dur = Date.now() - t0;
    console.error("[/api/matches] exception", { durMs: dur, err: err?.message });
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // GET -> POST taklidi (varsayılan fromTimestamp: now)
  return POST(new Request(req.url, { method: "POST", headers: req.headers, body: JSON.stringify({}) }));
}
