// app/api/matches/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

/**
 * /api/matches
 * Akış:
 * - httpOnly `access_token` cookie’si ya da gelen Authorization başlığı okunur.
 * - Authorization: Bearer <token> ile /v1/matches/list-filtered çağrılır.
 * - 401 olursa /v1/auth/refresh çağrılır, yeni token(lar) cookie’ye yazılır ve tek kez retry yapılır.
 */

const MATCHES_PATH = "/v1/matches/list-filtered";
const REFRESH_PATH = "/v1/auth/refresh";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const dbg = (...a: any[]) => { if (DEBUG) console.debug("[/api/matches]", ...a); };

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresInMs?: number;
};

function mask(v?: string | null, keep = 6) {
  if (!v) return "<none>";
  return `${String(v).slice(0, keep)}…(len=${String(v).length})`;
}
function setAuthCookies(out: NextResponse, auth: AuthResponse) {
  const isProd = process.env.NODE_ENV === "production";
  const accessMaxAge = Math.max(1, Math.floor((auth.expiresInMs ?? 0) / 1000)) || 60 * 15; // fallback 15dk
  out.cookies.set("access_token", auth.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });
  if (auth.refreshToken) {
    out.cookies.set("refresh_token", auth.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün — politikana göre ayarla
    });
  }
}

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL;
  const t0 = Date.now();

  // Body (sadece fromTimestamp kullanıyoruz)
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const now = Date.now();
  const payload = {
    fromTimestamp: typeof body.fromTimestamp === "number" ? body.fromTimestamp : now,
  };

  const headerStore = await headers();
  const cookieStore = await cookies();

  const incomingCookieHeader = headerStore.get("cookie") ?? "";
  const hdrAuth = headerStore.get("authorization") || "";
  const cookieAccess = cookieStore.get("access_token")?.value;
  const cookieRefresh = cookieStore.get("refresh_token")?.value;

  let authHeader = hdrAuth || (cookieAccess ? `Bearer ${cookieAccess}` : "");

  dbg("start", {
    envHasBase: Boolean(base),
    payload,
    cookieLen: incomingCookieHeader.length,
    hasHeaderAuth: !!hdrAuth,
    hasAccessCookie: !!cookieAccess,
    hasRefreshCookie: !!cookieRefresh,
    usingAuthMasked: mask(authHeader),
    via: hdrAuth ? "request-header" : cookieAccess ? "cookie" : "none",
    at: new Date().toISOString(),
  });

  if (!base) {
    dbg("NO_API_BASE_URL → boş liste");
    return NextResponse.json({ ok: true, items: [], debug: { reason: "NO_API_BASE_URL" } });
  }

  const url = `${base}${MATCHES_PATH}`;

  const callBackend = async (authorization: string) => {
    const r0 = performance.now();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: incomingCookieHeader,
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const dur = Math.round(performance.now() - r0);
    if (!res.ok) {
      let text = "";
      try { text = await res.clone().text(); } catch {}
      dbg("backend !ok", { status: res.status, durMs: dur, url, text: text ? text.slice(0, 200) : "<empty>" });
    } else {
      dbg("backend ok", { status: res.status, durMs: dur, url });
    }
    return res;
  };

  // 1) İlk deneme
  let res = authHeader ? await callBackend(authHeader) : new Response(null, { status: 401 });

  // 2) 401 ise refresh dene ve tek kez retry yap
  if (res.status === 401 && cookieRefresh) {
    const refreshUrl = `${base}${REFRESH_PATH}`;
    dbg("refresh:start", {
      usingRefreshCookie: !!cookieRefresh,
      refreshMasked: mask(cookieRefresh, 12),
    });

    const rr = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: incomingCookieHeader,
      },
      body: JSON.stringify({ refreshToken: cookieRefresh }),
      cache: "no-store",
    });

    let j: AuthResponse | any = null;
    let txt = "";
    try { j = await rr.clone().json(); } catch { txt = await rr.text().catch(() => ""); }

    dbg("refresh:result", {
      status: rr.status, ok: rr.ok,
      hasAccess: !!j?.accessToken,
      textPreview: txt ? txt.slice(0, 160) : "<empty>",
    });

    if (rr.ok && j?.accessToken) {
      authHeader = `Bearer ${j.accessToken}`;
      const retry = await callBackend(authHeader);

      if (retry.ok) {
        // başarılı → mapped sonucu döndür + yeni cookie’leri set et
        let list: any[] = [];
        try { list = await retry.clone().json(); } catch { list = []; }

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

        const out = NextResponse.json({
          ok: true,
          items,
          debug: {
            payloadSent: payload,
            backendUrl: url,
            rawCount: Array.isArray(list) ? list.length : -1,
            refreshed: true,
          },
        });
        setAuthCookies(out, j as AuthResponse);
        return out;
      }

      // retry de başarısız → aşağıdaki genel hata bloğuna düş
      res = retry;
    } else {
      // refresh başarısız → rr’yi baz al
      res = rr;
    }
  }

  // 3) Başarı / hata (refresh'e girmeden ya da başarısız refresh sonrası)
  if (!res.ok) {
    const dur = Date.now() - t0;
    const text = await res.text().catch(() => "");
    dbg("final !ok", { status: res.status, durMs: dur, text: text ? text.slice(0, 200) : "<empty>" });
    return NextResponse.json(
      { ok: false, message: text || `Liste alınamadı (status ${res.status})` },
      { status: res.status }
    );
  }

  const list: any[] = await res.json().catch((e) => {
    dbg("json parse error", e?.message || String(e));
    return [];
  });

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

  dbg("mapped", { mappedCount: items.length });

  return NextResponse.json({
    ok: true,
    items,
    debug: {
      payloadSent: payload,
      backendUrl: url,
      rawCount: Array.isArray(list) ? list.length : -1,
      refreshed: false,
    },
  });
}

// GET -> POST taklidi (varsayılan fromTimestamp: now)
export async function GET(req: Request) {
  return POST(new Request(req.url, { method: "POST", headers: req.headers, body: JSON.stringify({}) }));
}
