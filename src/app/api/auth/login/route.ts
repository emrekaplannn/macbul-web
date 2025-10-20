// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;      // "Bearer" beklenir
  expiresInMs?: number;    // access token süresi (ms)
} & Record<string, any>;

const ACCESS_KEYS = ["accessToken", "access_token", "token", "jwt", "idToken", "id_token"] as const;
const REFRESH_KEYS = ["refreshToken", "refresh_token", "rToken"] as const;

function pick(obj: any, keys: readonly string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const k of keys) {
    if (obj[k]) return String(obj[k]);
    if (obj.data?.[k]) return String(obj.data[k]); // bazı backendler data içinde döndürür
  }
  return null;
}

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json({ ok: false, message: "API_BASE_URL tanımlı değil" }, { status: 500 });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Email ve şifre zorunludur." }, { status: 400 });
  }

  // Backend login
  const loginRes = await fetch(`${base}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email, password }),
  });

  // Yanıtı json dene; değilse text parse et
  let json: LoginResponse = {};
  let text = "";
  try { json = await loginRes.clone().json(); } catch { text = await loginRes.text().catch(() => ""); }

  if (!loginRes.ok) {
    return NextResponse.json(
      { ok: false, message: (json as any)?.message || text || "Giriş başarısız" },
      { status: loginRes.status }
    );
  }

  // Tokenları çıkar
  const access = pick(json, ACCESS_KEYS);
  const refresh = pick(json, REFRESH_KEYS);
  if (!access) {
    return NextResponse.json({ ok: false, message: "Yanıtta access token yok" }, { status: 500 });
  }

  // Süreler
  const accessMs = Number.isFinite(json.expiresInMs) ? Number(json.expiresInMs) : 24 * 60 * 60 * 1000; // fallback 1 gün
  const accessMaxAge = Math.max(1, Math.floor(accessMs / 1000));
  // refresh için politika: ör. 30 gün (backend politikanla hizala)
  const refreshMaxAge = 60 * 60 * 24 * 30;

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true, tokenType: json.tokenType || "Bearer", expiresInMs: accessMs });

  // access_token cookie
  res.cookies.set("access_token", access, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  // refresh_token cookie (varsa)
  if (refresh) {
    res.cookies.set("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: refreshMaxAge,
    });
  }

  return res;
}
