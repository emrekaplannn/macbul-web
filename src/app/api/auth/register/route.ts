import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
};

// skillLevel → overallScore eşlemesi (backend alanı)
const LEVEL_TO_SCORE: Record<string, number> = {
  beginner: 30,
  intermediate: 50,
  advanced: 70,
  professional: 90,
  any: 50,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Frontend (FullSchema) → Backend (RegisterRequest) map
    const payload = {
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      fullName: `${body.firstName ?? ""} ${body.lastName ?? ""}`.trim() || undefined,
      phone: body.phone ?? undefined,
      position: body.position ?? undefined,
      avatarPath: undefined,
      referralCode: body.referralCode ?? undefined,
      overallScore: LEVEL_TO_SCORE[body.skillLevel ?? "intermediate"] ?? 50,
      location: body.city ?? undefined,
      // birthDate / terms / marketing backend beklemiyor → göndermiyoruz
    };

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return Response.json(
        { ok: false, message: "API_BASE_URL tanımlı değil (.env.local)" },
        { status: 500 }
      );
    }

    const apiRes = await fetch(`${apiBase}/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await apiRes
      .json()
      .catch(() => ({}))) as Partial<BackendAuthResponse> & { message?: string };

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: data?.message || "Kayıt başarısız",
        }),
        { status: apiRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // HTTP-only cookie’ler
    const c = await cookies(); // Next 14+ cookies() async
    const expires =
      typeof data.expiresInMs === "number"
        ? new Date(Date.now() + data.expiresInMs)
        : undefined;

    const common = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      ...(expires ? { expires } : {}),
    };

    if (data.accessToken) c.set("accessToken", data.accessToken, common);
    if (data.refreshToken) c.set("refreshToken", data.refreshToken, common);
    c.set("tokenType", data.tokenType ?? "Bearer", common);

    return Response.json({ ok: true });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: err?.message ?? "Sunucu hatası",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
