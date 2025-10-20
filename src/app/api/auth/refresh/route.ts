import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

/** Backend URL – wallet/join ile tutarlı */
const BASE = process.env.API_BASE_URL;

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;  // genelde "Bearer"
  expiresInMs: number; // access token süresi
};

// güvenli cookie yardımcıları
function setAuthCookies(res: NextResponse, auth: AuthResponse) {
  const isProd = process.env.NODE_ENV === "production";

  // Access Token: kısa ömürlü
  res.cookies.set("access_token", auth.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    // erişim token’ını 'expiresInMs' kadar süreyle ayarlayalım
    maxAge: Math.floor(auth.expiresInMs / 1000),
  });

  // Refresh Token (rotation olabilir): varsa güncelle
  if (auth.refreshToken) {
    // refresh için daha uzun bir ömür veriyorsan backend’e göre ayarla
    res.cookies.set("refresh_token", auth.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      // örnek: 30 gün — backend’in politikasına göre yönet
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!BASE) {
    return NextResponse.json({ ok: false, message: "NO_API_BASE_URL" }, { status: 500 });
  }

  const h = await headers();
  const c = await cookies();

  // 1) refresh token’ı nereden alacağımız:
  // - Tercihen 'refresh_token' cookie (httpOnly)
  // - Alternatif: body.refreshToken (mobil vb. durumlar için)
  const cookieRefresh = c.get("refresh_token")?.value;
  const body = await req.json().catch(() => ({} as any));
  const refreshToken: string | undefined = body?.refreshToken || cookieRefresh;

  if (!refreshToken) {
    return NextResponse.json(
      { ok: false, message: "Missing refresh token" },
      { status: 401 }
    );
  }

  // 2) Backend’e proxy et
  const incomingCookie = h.get("cookie") ?? "";
  const res = await fetch(`${BASE}/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // bazı kurulumlarda backend refresh endpoint’i session cookie de isteyebilir
      cookie: incomingCookie,
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  // 3) Gövdeyi oku (JSON değilse text yakala)
  let data: AuthResponse | any = null;
  let text = "";
  try { data = await res.clone().json(); } catch { text = await res.text().catch(() => ""); }

  if (!res.ok || !data?.accessToken) {
    const message = (data && typeof data === "object" && "message" in data)
      ? data.message
      : (text || `Refresh failed (${res.status})`);
    return NextResponse.json({ ok: false, message }, { status: res.status || 400 });
  }

  // 4) Yeni cookie’leri ayarla ve yanıtla
  const out = NextResponse.json({ ok: true, tokenType: data.tokenType, expiresInMs: data.expiresInMs }, { status: 200 });
  setAuthCookies(out, data as AuthResponse);
  return out;
}
