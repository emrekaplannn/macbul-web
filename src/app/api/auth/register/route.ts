// app/api/auth/register/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;   // "Bearer"
  expiresInMs: number; // access token ömrü (ms)
};

const LEVEL_TO_SCORE: Record<string, number> = {
  beginner: 30,
  intermediate: 50,
  advanced: 70,
  professional: 90,
  any: 50,
};

export async function POST(req: Request) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json(
      { ok: false, message: "API_BASE_URL tanımlı değil (.env.local)" },
      { status: 500 }
    );
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: "Email ve şifre zorunludur." },
      { status: 400 }
    );
  }

  // Frontend → Backend field map
  const payload = {
    email,
    password,
    fullName: `${body.firstName ?? ""} ${body.lastName ?? ""}`.trim() || undefined,
    phone: body.phone ?? undefined,
    position: body.position ?? undefined,
    avatarPath: undefined,
    referralCode: body.referralCode ?? undefined,
    overallScore: LEVEL_TO_SCORE[body.skillLevel ?? "intermediate"] ?? 50,
    location: body.city ?? undefined,
  };

  const apiRes = await fetch(`${apiBase}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  let data: Partial<BackendAuthResponse> & { message?: string } = {};
  let text = "";
  try { data = await apiRes.clone().json(); }
  catch { text = await apiRes.text().catch(() => ""); }

  if (!apiRes.ok) {
    return NextResponse.json(
      { ok: false, message: data?.message || text || "Kayıt başarısız" },
      { status: apiRes.status }
    );
  }

  const access = data.accessToken;
  const refresh = data.refreshToken;
  if (!access) {
    return NextResponse.json(
      { ok: false, message: "Yanıtta access token yok" },
      { status: 500 }
    );
  }

  const isProd = process.env.NODE_ENV === "production";
  const accessMs = Number.isFinite(data.expiresInMs) ? Number(data.expiresInMs) : 24 * 60 * 60 * 1000;
  const accessMaxAge = Math.max(1, Math.floor(accessMs / 1000));
  const refreshMaxAge = 60 * 60 * 24 * 30; // politikana göre ayarla

  const res = NextResponse.json({ ok: true });

  // access_token (short-lived)
  res.cookies.set("access_token", access, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  // refresh_token (long-lived)
  if (refresh) {
    res.cookies.set("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: refreshMaxAge,
    });
  }

  // tokenType'ı cookie'ye yazmaya gerek yok
  return res;
}
