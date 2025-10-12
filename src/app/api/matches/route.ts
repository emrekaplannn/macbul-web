import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

/**
 * /api/matches
 * Akış:
 * - Login ekranında yazdığımız httpOnly `access_token` cookie’si okunur
 * - Authorization: Bearer <token> ile /v1/matches/list-filtered çağrılır
 */

const MATCHES_PATH = "/v1/matches/list-filtered";

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

  // 1) Authorization başlığı header’dan ya da cookie’den
  const incomingAuthHeader = headerStore.get("authorization") || "";
  const cookieToken = cookieStore.get("access_token")?.value;
  const authHeader =
    incomingAuthHeader || (cookieToken ? `Bearer ${cookieToken}` : "");

  // Teşhis
  console.log("[/api/matches] start", {
    envHasBase: Boolean(base),
    payload,
    cookieLen: incomingCookieHeader.length,
    hasAuthHeader: Boolean(authHeader),
    via: incomingAuthHeader ? "request-header" : cookieToken ? "cookie" : "none",
    at: new Date().toISOString(),
  });

  if (!base) {
    console.warn("[/api/matches] API_BASE_URL yok; boş liste.");
    return NextResponse.json({ ok: true, items: [], debug: { reason: "NO_API_BASE_URL" } });
  }

  // Token zorunlu
  if (!authHeader) {
    return NextResponse.json(
      { ok: false, message: "Yetkisiz: access token bulunamadı. Lütfen giriş yapın." },
      { status: 401 }
    );
  }

  const url = `${base}${MATCHES_PATH}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: incomingCookieHeader,         // varsa ek cookie’ler
        Authorization: authHeader,            // asıl auth
      },
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

    // DTO -> UI map + status
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

// GET -> POST taklidi (varsayılan fromTimestamp: now)
export async function GET(req: Request) {
  return POST(new Request(req.url, { method: "POST", headers: req.headers, body: JSON.stringify({}) }));
}
