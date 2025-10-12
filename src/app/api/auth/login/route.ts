import { NextResponse } from "next/server";

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresInMs?: number;
} & Record<string, any>;

const MAP_TOKEN_KEYS = [
  "accessToken", "access_token", "token", "jwt", "idToken", "id_token",
] as const;

function extractToken(json: any): string | null {
  if (!json || typeof json !== "object") return null;
  for (const k of MAP_TOKEN_KEYS) {
    if (json[k]) return String(json[k]);
    if (json.data?.[k]) return String(json.data[k]);
  }
  return null;
}

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { ok: false, message: "API_BASE_URL tanımlı değil" },
      { status: 500 }
    );
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  // Beklenen: { email, password }
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: "Email ve şifre zorunludur." },
      { status: 400 }
    );
  }

  // Backend login
  const loginRes = await fetch(`${base}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email, password }),
  });

  const text = await loginRes.text().catch(() => "");
  let json: LoginResponse = {};
  try { json = JSON.parse(text); } catch { json = {} as any; }

  if (!loginRes.ok) {
    return NextResponse.json(
      { ok: false, message: json?.message || "Giriş başarısız" },
      { status: loginRes.status }
    );
  }

  // Token çıkar
  const token = extractToken(json);
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Yanıtta access token yok" },
      { status: 500 }
    );
  }

  // Süre (ms) varsa kullan, yoksa 1 gün
  const ms = Number(json.expiresInMs ?? 24 * 60 * 60 * 1000);
  const expires = new Date(Date.now() + (isNaN(ms) ? 24 * 60 * 60 * 1000 : ms));

  const res = NextResponse.json({ ok: true });
  // Prod’da secure, sameSite=strict/none ayarını ortamına göre düzenle
  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return res;
}
