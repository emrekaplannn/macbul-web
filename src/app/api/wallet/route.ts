// app/api/wallet/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

const PATH = "/v1/wallets/user";
const REFRESH_PATH = "/v1/auth/refresh";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const dbg = (...a: any[]) => { if (DEBUG) console.debug("[WALLET]", ...a); };

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
};

function mask(v?: string | null, keep = 6) {
  if (!v) return "<none>";
  return `${v.slice(0, keep)}…(len=${v.length})`;
}
function setAuthCookies(out: NextResponse, auth: AuthResponse) {
  const isProd = process.env.NODE_ENV === "production";
  out.cookies.set("access_token", auth.accessToken, {
    httpOnly: true, secure: isProd, sameSite: "lax", path: "/",
    maxAge: Math.max(1, Math.floor((auth.expiresInMs ?? 0) / 1000)) || 900, // fallback 15dk
  });
  if (auth.refreshToken) {
    out.cookies.set("refresh_token", auth.refreshToken, {
      httpOnly: true, secure: isProd, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export async function GET(_req: Request) {
  const base = process.env.API_BASE_URL;
  const h = await headers();
  const c = await cookies();

  dbg("env", { NODE_ENV: process.env.NODE_ENV, API_BASE_URL: base ? "(present)" : "(missing)" });
  if (!base) return NextResponse.json({ ok: true, wallet: null, reason: "NO_API_BASE_URL" });

  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieAccess = c.get("access_token")?.value;
  const cookieRefresh = c.get("refresh_token")?.value;

  let auth = hdrAuth || (cookieAccess ? `Bearer ${cookieAccess}` : "");
  dbg("auth-check", {
    hasHeaderAuth: !!hdrAuth, headerAuthMasked: mask(hdrAuth),
    hasAccessCookie: !!cookieAccess, accessCookieMasked: mask(cookieAccess, 12),
    hasRefreshCookie: !!cookieRefresh, refreshCookieMasked: mask(cookieRefresh, 12),
    constructedAuthMasked: mask(auth),
  });

  if (!auth && !cookieRefresh) {
    dbg("fail:no-auth-and-no-refresh");
    return NextResponse.json({ ok: false, message: "Yetkisiz: access token yok." }, { status: 401 });
  }

  // 1) İlk deneme
  const tryWallet = async (authorization: string) => {
    dbg("request", { url: `${base}${PATH}`, method: "GET", auth: authorization ? "(present)" : "(none)" });
    const r = await fetch(`${base}${PATH}`, {
      method: "GET",
      headers: { cookie: incomingCookie, Authorization: authorization },
      cache: "no-store",
    });
    dbg("response:headers", {
      status: r.status, ok: r.ok,
      "content-type": r.headers.get("content-type"),
      "www-authenticate": r.headers.get("www-authenticate"),
    });
    return r;
  };

  let res = auth ? await tryWallet(auth) : new Response(null, { status: 401 });

  // 2) 401'de refresh dene + bir kez retry
  if (res.status === 401 && cookieRefresh) {
    dbg("refresh:start");
    const r = await fetch(`${base}${REFRESH_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: incomingCookie },
      body: JSON.stringify({ refreshToken: cookieRefresh }),
      cache: "no-store",
    });

    let j: AuthResponse | any = null; let txt = "";
    try { j = await r.clone().json(); } catch { txt = await r.text().catch(() => ""); }
    dbg("refresh:result", { status: r.status, ok: r.ok, hasAccess: !!j?.accessToken, textPreview: txt ? txt.slice(0, 140) : "<empty>" });

    if (r.ok && j?.accessToken) {
      auth = `Bearer ${j.accessToken}`;
      const retry = await tryWallet(auth);
      if (retry.ok) {
        let wallet: any = null;
        try { wallet = await retry.clone().json(); } catch {}
        const out = NextResponse.json({ ok: true, wallet });
        setAuthCookies(out, j as AuthResponse);
        dbg("success:after-refresh", { walletKeys: wallet ? Object.keys(wallet) : "<none>" });
        return out;
      }
      res = retry; // retry da başarısızsa alttaki hata bloğuna düş
    } else {
      // refresh de başarısız → orijinal 401'i döndir
      res = r;
    }
  }

  if (!res.ok) {
    let text = "";
    try { text = await res.clone().text(); } catch {}
    dbg("response:error", { status: res.status, textPreview: text ? text.slice(0, 200) : "<empty>" });
    return NextResponse.json({ ok: false, message: text || `Wallet alınamadı (${res.status})` }, { status: res.status });
  }

  let wallet: any = null;
  try { wallet = await res.clone().json(); } catch {}
  dbg("success", { gotWallet: wallet != null, keys: wallet && typeof wallet === "object" ? Object.keys(wallet) : "<non-object>" });
  return NextResponse.json({ ok: true, wallet });
}
