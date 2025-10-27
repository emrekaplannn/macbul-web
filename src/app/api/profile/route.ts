// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const log = (...a: any[]) => { if (DEBUG) console.debug("[PROFILE-API]", ...a); };

const ME_PATH = "/v1/profile/me";
const HISTORY_PATH_PREFIX = "/v1/match-player-results/user"; // /{id}
const MATCH_PATH_PREFIX = "/v1/matches";                      // /{matchId}
const TEAM_RESULTS_PREFIX = "/v1/match-team-results/match";   // /{matchId}
const MATCH_RESULT_PREFIX = "/v1/match-results/match";        // /{matchId}
const REFRESH_PATH = "/v1/auth/refresh";

// ---- Types (senin verdiğinler)
type MeDto = {
  id: string;
  email: string;
  emailVerified?: boolean;
  isBanned?: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  position?: string;
  overall?: number;
};

type PlayerResultDto = {
  matchPlayerResultId: number;
  matchId: string;
  userId: string;
  teamLabel: "A" | "B";
  attendanceStatus: "PLAYED" | "NO_SHOW" | "INJURED";
  position?: string | null;
  goals: number;
  assists: number;
  ownGoals: number;
  saves: number;
  rating?: number | null;
  mvp: boolean;
  notes?: string | null;
  createdAt: number;
  updatedAt: number;
};

type MatchDto = {
  id: string;
  organizerId: string;
  fieldName: string;
  address: string;
  city: string;
  matchTimestamp: number;
  pricePerUser: string | number;
  totalSlots: number;
  createdAt: number;
};

type TeamScoreDto = {
  matchTeamResultId: number;
  matchId: string;
  teamLabel: "A" | "B";
  score: number;
  isWinner: boolean;
  createdAt: number;
  updatedAt: number;
};

type MatchResultDto = {
  matchResultId: number;
  matchId: string;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELED" | "ABANDONED";
  startedAt?: number | null;
  endedAt?: number | null;
  winningTeam?: "A" | "B" | "DRAW";
  notes?: string | null;
  createdAt: number;
  updatedAt: number;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
};

// ---- Helpers
function mask(v?: string | null, keep = 6) {
  if (!v) return "<none>";
  return `${v.slice(0, keep)}…(len=${v.length})`;
}

function setAuthCookies(out: NextResponse, auth: AuthResponse) {
  const isProd = process.env.NODE_ENV === "production";
  out.cookies.set("access_token", auth.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(1, Math.floor((auth.expiresInMs ?? 0) / 1000)) || 900,
  });
  if (auth.refreshToken) {
    out.cookies.set("refresh_token", auth.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

async function fetchJSON<T>(url: string, init?: RequestInit) {
  const t0 = DEBUG ? performance.now() : 0;
  const res = await fetch(url, { ...init, cache: "no-store" });
  let data: any = {};
  try { data = await res.json(); } catch { /* text olabilir */ }
  const took = DEBUG ? Math.round(performance.now() - t0) : 0;
  return { res, data: data as T, took };
}

export async function GET() {
  const base = process.env.API_BASE_URL;
  log("env", { NODE_ENV: process.env.NODE_ENV, API_BASE_URL: base ? "(present)" : "(missing)" });
  if (!base) return NextResponse.json({ ok: false, message: "NO_API_BASE_URL" }, { status: 500 });

  const h = await headers();
  const c = await cookies();

  const incomingCookie = h.get("cookie") ?? "";
  const hdrAuth = h.get("authorization") || "";
  const cookieAccess = c.get("access_token")?.value;
  const cookieRefresh = c.get("refresh_token")?.value;

  let auth = hdrAuth || (cookieAccess ? `Bearer ${cookieAccess}` : "");

  log("auth-check", {
    hasHdrAuth: !!hdrAuth, hdrAuthMasked: mask(hdrAuth),
    hasAccessCookie: !!cookieAccess, accessMasked: mask(cookieAccess, 12),
    hasRefreshCookie: !!cookieRefresh, refreshMasked: mask(cookieRefresh, 12),
    constructedAuthMasked: mask(auth),
  });

  if (!auth && !cookieRefresh) {
    log("fail", "no-auth-and-no-refresh");
    return NextResponse.json({ ok: false, message: "Yetkisiz: access token yok." }, { status: 401 });
  }

  const baseHeaders = (authorization: string): HeadersInit => ({
    ...(incomingCookie ? { cookie: incomingCookie } : {}),
    ...(authorization ? { Authorization: authorization } : {}),
  });

  // ---- 1) ME çağrısı + gerekirse refresh
  const meUrl = `${base}${ME_PATH}`;
  const tryMe = async (authorization: string) => {
    log("request:me", { url: meUrl, auth: authorization ? "(present)" : "(none)" });
    return fetchJSON<MeDto>(meUrl, { headers: baseHeaders(authorization) });
  };

  let { res: meRes, data: me, took: meTook } = auth
    ? await tryMe(auth)
    : { res: new Response(null, { status: 401 }), data: {} as MeDto, took: 0 };

  log("response:me", { status: meRes.status, ok: meRes.ok, took_ms: meTook, email: (me as any)?.email });

  // 401 ise refresh dene
  if (meRes.status === 401 && cookieRefresh) {
    log("refresh:start");
    const r = await fetch(`${base}${REFRESH_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: incomingCookie },
      body: JSON.stringify({ refreshToken: cookieRefresh }),
      cache: "no-store",
    });

    let j: AuthResponse | any = null; let txt = "";
    try { j = await r.clone().json(); } catch { txt = await r.text().catch(() => ""); }
    log("refresh:result", { status: r.status, ok: r.ok, hasAccess: !!j?.accessToken, textPreview: txt?.slice(0, 140) ?? "<empty>" });

    if (r.ok && j?.accessToken) {
      auth = `Bearer ${j.accessToken}`;
      const retry = await tryMe(auth);
      meRes = retry.res; me = retry.data; meTook = retry.took;
      log("response:me:after-refresh", { status: meRes.status, ok: meRes.ok, took_ms: meTook, email: (me as any)?.email });

      if (meRes.ok && (me as any)?.id) {
        const out = await buildOkResponse(base, auth, incomingCookie, me as MeDto);
        // yeni tokenları set et
        setAuthCookies(out, j as AuthResponse);
        return out;
      }
    }

    // refresh başarısızsa orijinal 401’i döndür
    if (!r.ok) {
      let t = "";
      try { t = await r.clone().text(); } catch {}
      log("refresh:fail", { status: r.status, textPreview: t?.slice(0, 200) || "<empty>" });
      return NextResponse.json({ ok: false, message: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  if (!meRes.ok || !(me as any)?.id) {
    let t = "";
    try { t = await meRes.clone().text(); } catch {}
    log("response:me:error", { status: meRes.status, textPreview: t?.slice(0, 200) || "<empty>" });
    return NextResponse.json({ ok: false, message: "UNAUTHORIZED" }, { status: 401 });
  }

  // access token hâlâ geçerliyken devam
  return buildOkResponse(base, auth, incomingCookie, me as MeDto);
}

// ---- success payloadı hazırlayan fonksiyon
async function buildOkResponse(base: string, auth: string, incomingCookie: string, me: MeDto) {
  const hdrs: HeadersInit = {
    ...(incomingCookie ? { cookie: incomingCookie } : {}),
    ...(auth ? { Authorization: auth } : {}),
  };

  // 2) History (son 10)
  const histUrl = `${base}${HISTORY_PATH_PREFIX}/${me.id}`;
  const { res: hRes, data: history, took: hTook } =
    await fetchJSON<PlayerResultDto[] | { message?: string }>(histUrl, { headers: hdrs });
  const playerHistory: PlayerResultDto[] = Array.isArray(history) ? history.slice(0, 10) : [];
  log("history", { status: hRes.status, ok: hRes.ok, took_ms: hTook, count: playerHistory.length });

  // 3) Her maç için temel detaylar + skor + kazanan
  const packed = await Promise.all(
    playerHistory.map(async (p) => {
      const mUrl = `${base}${MATCH_PATH_PREFIX}/${p.matchId}`;
      const tUrl = `${base}${TEAM_RESULTS_PREFIX}/${p.matchId}`;
      const rUrl = `${base}${MATCH_RESULT_PREFIX}/${p.matchId}`;

      const [m, t, r] = await Promise.all([
        fetchJSON<MatchDto>(mUrl, { headers: hdrs }),
        fetchJSON<TeamScoreDto[] | { message?: string }>(tUrl, { headers: hdrs }),
        fetchJSON<MatchResultDto | { message?: string }>(rUrl, { headers: hdrs }),
      ]);

      log("fetch:match-bundle", {
        matchId: p.matchId,
        match: { status: m.res.status, took_ms: m.took },
        teamResults: { status: t.res.status, took_ms: t.took },
        result: { status: r.res.status, took_ms: r.took },
      });

      const teams: TeamScoreDto[] = Array.isArray(t.data) ? t.data : [];
      const scoreA = teams.find((x) => x.teamLabel === "A")?.score ?? 0;
      const scoreB = teams.find((x) => x.teamLabel === "B")?.score ?? 0;

      return {
        player: p,
        match: m.data,
        scoreA,
        scoreB,
        winningTeam: (r.data as MatchResultDto)?.winningTeam ??
          (scoreA === scoreB ? "DRAW" : scoreA > scoreB ? "A" : "B"),
      };
    })
  );

  // 4) Basit istatistikler
  const totals = playerHistory.reduce(
    (acc, cur) => {
      acc.matches += 1;
      acc.goals += cur.goals || 0;
      acc.assists += cur.assists || 0;
      if (typeof cur.rating === "number") {
        acc.ratingSum += cur.rating;
        acc.ratingCount += 1;
      }
      if (cur.mvp) acc.motm += 1;
      return acc;
    },
    { matches: 0, goals: 0, assists: 0, ratingSum: 0, ratingCount: 0, motm: 0 }
  );

  const avgRating = totals.ratingCount ? +(totals.ratingSum / totals.ratingCount).toFixed(1) : null;
  const overall = typeof me.overall === "number"
    ? me.overall
    : (avgRating ? Math.min(99, Math.max(50, Math.round(avgRating * 1))) : 82); // rating (0-100) beklediğin için *1

  log("stats", {
    matches: totals.matches, goals: totals.goals, assists: totals.assists,
    avgRating, motm: totals.motm, overall,
  });

  const payload = {
    ok: true,
    me,
    stats: {
      totalMatches: totals.matches,
      goals: totals.goals,
      assists: totals.assists,
      avgRating,
      motm: totals.motm,
      overall,
    },
    recent: packed.map((x) => ({
      matchId: x.match?.id || x.player.matchId,
      fieldName: x.match?.fieldName ?? "Halı Saha",
      city: x.match?.city ?? "",
      time: x.match?.matchTimestamp ?? x.player.createdAt,
      scoreA: x.scoreA,
      scoreB: x.scoreB,
      winningTeam: x.winningTeam,
      my: {
        goals: x.player.goals,
        assists: x.player.assists,
        rating: x.player.rating ?? null,
        team: x.player.teamLabel,
      },
    })),
    trend: packed
      .map((x) => (typeof x.player.rating === "number" ? x.player.rating : null))
      .filter((v) => v !== null)
      .slice(-10),
  };

  log("ok:response", {
    meId: me.id,
    recentCount: payload.recent.length,
    trendLen: payload.trend.length,
  });

  return NextResponse.json(payload, { status: 200 });
}
