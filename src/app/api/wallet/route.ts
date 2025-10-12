import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

const PATH = "/v1/wallets/user";

export async function GET(req: Request) {
  const base = process.env.API_BASE_URL;
  const h = await headers();
  const c = await cookies();

  if (!base) {
    return NextResponse.json({ ok: true, wallet: null, reason: "NO_API_BASE_URL" });
  }

  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieToken = c.get("access_token")?.value;
  const auth = hdrAuth || (cookieToken ? `Bearer ${cookieToken}` : "");

  if (!auth) {
    return NextResponse.json(
      { ok: false, message: "Yetkisiz: access token yok." },
      { status: 401 }
    );
  }

  const res = await fetch(`${base}${PATH}`, {
    method: "GET",
    headers: { cookie: incomingCookie, Authorization: auth },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, message: text || `Wallet alınamadı (${res.status})` },
      { status: res.status }
    );
  }

  const wallet = await res.json().catch(() => null);
  return NextResponse.json({ ok: true, wallet });
}
