// app/api/past-matches/route.ts
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const dbg = (...a: any[]) => { if (DEBUG) console.debug("[PAST-MATCHES]", ...a); };

const REFRESH_PATH = "/v1/auth/refresh";

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresInMs: number;
};

// ---- DTO'lar (typing için) ----
type TeamLabel = "A" | "B";
type AttendanceStatus = "JOINED" | "LEFT" | "NO_SHOW" | "SUBSTITUTE" | string;

type MatchPlayerResultDto = {
  matchPlayerResultId: number;
  matchId: string;
  userId: string;
  teamLabel: TeamLabel;
  attendanceStatus: AttendanceStatus;
  position: string | null;
  goals: number | null;
  assists: number | null;
  ownGoals: number | null;
  saves: number | null;
  rating: number | null; // 0-100
  mvp: boolean | null;
  notes: string | null;
  createdAt: number | null;
  updatedAt: number | null;
};

function setAuthCookies(out: NextResponse, auth: AuthResponse) {
  const isProd = process.env.NODE_ENV === "production";
  out.cookies.set("access_token", auth.accessToken, {
    httpOnly: true, secure: isProd, sameSite: "lax", path: "/",
    maxAge: Math.max(1, Math.floor((auth.expiresInMs ?? 0) / 1000)) || 900,
  });
  if (auth.refreshToken) {
    out.cookies.set("refresh_token", auth.refreshToken, {
      httpOnly: true, secure: isProd, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
  }
}

async function fetchJSON<T>(url: string, init?: RequestInit) {
  const r = await fetch(url, { cache: "no-store", ...init });
  let data: any = null;
  try { data = await r.clone().json(); } catch {}
  return { r, data: data as T };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json({ ok: false, message: "NO_API_BASE_URL" }, { status: 500 });
  }

  const range = url.searchParams.get("range") ?? "ALL";
  const result = url.searchParams.get("result") ?? "ALL"; // WIN|LOSS|DRAW|ALL
  const venue = url.searchParams.get("venue") ?? "ALL";
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = Math.min(50, parseInt(url.searchParams.get("pageSize") ?? "10", 10));

  const h = await headers();
  const c = await cookies();

  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieAccess = c.get("access_token")?.value;
  const cookieRefresh = c.get("refresh_token")?.value;

  let auth = hdrAuth || (cookieAccess ? `Bearer ${cookieAccess}` : "");
  const fwd = (Authorization?: string) => ({
    headers: {
      ...(incomingCookie ? { cookie: incomingCookie } : {}),
      ...(Authorization ? { Authorization } : {}),
    }
  });

  // helper: call with refresh if 401
  const withRefresh = async <T,>(url: string, initAuth: string) => {
    let { r, data } = await fetchJSON<T>(url, fwd(initAuth));
    if (r.status !== 401) return { r, data, authUsed: initAuth };

    if (!cookieRefresh) return { r, data, authUsed: initAuth };

    dbg("refresh:start");
    const rr = await fetch(`${base}${REFRESH_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: incomingCookie },
      body: JSON.stringify({ refreshToken: cookieRefresh }),
      cache: "no-store",
    });

    let j: AuthResponse | null = null;
    try { j = await rr.clone().json(); } catch {}
    if (!rr.ok || !j?.accessToken) return { r, data, authUsed: initAuth };

    const newAuth = `Bearer ${j.accessToken}`;
    const retry = await fetchJSON<T>(url, fwd(newAuth));

    // Not: Cookie'leri gerçekten set etmek için response'a eklemek gerekir.
    // Burada sadece refresh başarılı oldu bilgisini dönüyoruz; aşağıda JSON dönerken cookie set edilebilir.
    return { r: retry.r, data: retry.data, authUsed: newAuth, refreshed: j as AuthResponse };
  };

  try {
    // 1) me
    const meUrl = `${base}/v1/profile/me`;
    const meCall = await withRefresh<any>(meUrl, auth);
    if (!meCall.r.ok || !meCall.data?.id) {
      return NextResponse.json({ ok: false, message: "UNAUTHORIZED" }, { status: 401 });
    }
    auth = meCall.authUsed; // possibly refreshed
    const me = meCall.data;

    // 2) player results of the user
    const prUrl = `${base}/v1/match-player-results/user/${me.id}`;
    const pr = await fetchJSON<any[]>(prUrl, fwd(auth));
    if (!pr.r.ok) {
      const txt = await pr.r.text().catch(() => "");
      return NextResponse.json({ ok: false, message: txt || "Results fetch failed" }, { status: pr.r.status });
    }
    const all = Array.isArray(pr.data) ? pr.data : [];

    // apply range filter (client-side for now)
    const now = Date.now();
    const from = (() => {
      switch (range) {
        case "7D": return now - 7 * 864e5;
        case "30D": return now - 30 * 864e5;
        case "3M": return now - 90 * 864e5;
        case "6M": return now - 180 * 864e5;
        case "YTD": return new Date(new Date().getFullYear(), 0, 1).getTime();
        default: return 0; // ALL
      }
    })();

    // 3) hydrate each match with details + **OYUNCULAR**
    const hydrated = await Promise.all(
      all.map(async (p) => {
        const mUrl = `${base}/v1/matches/${p.matchId}`;
        const tUrl = `${base}/v1/match-team-results/match/${p.matchId}`;
        const rUrl = `${base}/v1/match-results/match/${p.matchId}`;
        const plUrl = `${base}/v1/match-player-results/match/${p.matchId}`; // ✅ EKLENDİ

        const [m, t, r, pl] = await Promise.all([
          fetchJSON<any>(mUrl, fwd(auth)),
          fetchJSON<any[]>(tUrl, fwd(auth)),
          fetchJSON<any>(rUrl, fwd(auth)),
          fetchJSON<MatchPlayerResultDto[]>(plUrl, fwd(auth)), // ✅ EKLENDİ
        ]);

        const teams = Array.isArray(t.data) ? t.data : [];
        const scoreA = teams.find((x) => x.teamLabel === "A")?.score ?? 0;
        const scoreB = teams.find((x) => x.teamLabel === "B")?.score ?? 0;
        const winningTeam = r.data?.winningTeam ?? (scoreA === scoreB ? "DRAW" : scoreA > scoreB ? "A" : "B");

        const match = m.data || {};
        const time = match?.matchTimestamp ?? p.createdAt ?? 0;

        // ✅ Oyuncu listesi: backend DTO’dan gerekli alanları topla
        const players =
          Array.isArray(pl.data)
            ? pl.data.map((row) => ({
                userId: row.userId,
                team: row.teamLabel as TeamLabel,
                position: row.position ?? null,
                attendanceStatus: row.attendanceStatus,
                goals: row.goals ?? 0,
                assists: row.assists ?? 0,
                ownGoals: row.ownGoals ?? 0,
                saves: row.saves ?? 0,
                rating: typeof row.rating === "number" ? row.rating : null,
                mvp: !!row.mvp,
                notes: row.notes ?? null,
              }))
            : [];

        return {
          matchId: p.matchId,
          team: p.teamLabel as TeamLabel, // current user’ın takımı
          goals: p.goals ?? 0,
          assists: p.assists ?? 0,
          rating: typeof p.rating === "number" ? p.rating : null,
          mvp: !!p.mvp,
          time,
          venue: match?.fieldName ?? "Halı Saha",
          city: match?.city ?? "",
          districtName: match?.districtName ?? null,   // 🔥 EKLENDİ
          scoreA,
          scoreB,
          winningTeam,
          position: p.position ?? null,
          durationMin: match?.durationMin ?? 60,

          // tüm oyuncu özetleri
          players,
        };

      })
    );

    // result + venue + date filter
    const filtered = hydrated.filter((x) => {
      if (from && x.time < from) return false;
      if (result !== "ALL") {
        const won = x.winningTeam === "DRAW" ? "DRAW" : (x.winningTeam === x.team ? "WIN" : "LOSS");
        if (result === "WIN" && won !== "WIN") return false;
        if (result === "LOSS" && won !== "LOSS") return false;
        if (result === "DRAW" && won !== "DRAW") return false;
      }
      if (venue !== "ALL" && x.venue !== venue) return false;
      return true;
    });

    // sort desc by time
    filtered.sort((a, b) => b.time - a.time);

    // pagination
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    // summary
    const sum = filtered.reduce(
      (acc, m) => {
        acc.total += 1;
        if (m.winningTeam === "DRAW") acc.draw += 1;
        else if (m.winningTeam === m.team) acc.win += 1;
        else acc.loss += 1;

        acc.goals += m.goals || 0;
        acc.assists += m.assists || 0;
        if (typeof m.rating === "number") { acc.ratingSum += m.rating; acc.ratingCount += 1; }
        return acc;
      },
      { total: 0, win: 0, loss: 0, draw: 0, goals: 0, assists: 0, ratingSum: 0, ratingCount: 0 }
    );

    const avgRating = sum.ratingCount ? +(sum.ratingSum / sum.ratingCount).toFixed(1) : null;
    const successRate = sum.total ? Math.round((sum.win / sum.total) * 100) : 0;

    // Eğer refresh'te yeni token alındıysa cookie set ederek dönelim (opsiyonel ama doğru yaklaşım)
    const out = NextResponse.json({
      ok: true,
      filters: { range, result, venue, page, pageSize },
      summary: {
        totalMatches: sum.total,
        wins: sum.win,
        losses: sum.loss,
        draws: sum.draw,
        goals: sum.goals,
        assists: sum.assists,
        avgRating,
        successRate,
      },
      items,
      total,
      hasNext: start + pageSize < total,
      hasPrev: page > 1,
    });

    if (typeof (meCall as any).refreshed !== "undefined") {
      setAuthCookies(out, (meCall as any).refreshed as AuthResponse);
    }

    return out;
  } catch (e: any) {
    dbg("error", e?.message);
    return NextResponse.json({ ok: false, message: e?.message ?? "Error" }, { status: 500 });
  }
}
