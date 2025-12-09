"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { formatTL } from "@/lib/format";
import { useMatchDetail } from "@/features/match-detail/useMatchDetail";
import { authFetch } from "@/lib/authFetch";

import PlayerFeedbackCard from "@/components/match-feedback/PlayerFeedbackCard";
import MatchFeedbackPanel from "@/components/match-feedback/MatchFeedbackPanel";
import SummaryCard from "@/components/match-feedback/SummaryCard";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const dbg = (...args: any[]) => { if (DEBUG) console.debug("[MatchFeedback]", ...args); };

type TeamFilter = "all" | "A" | "B";

// UI oyuncu modeli
type UiPlayer = {
  id: string;
  name: string;
  initials: string;
  team: "A" | "B";
  avatarUrl?: string | null;
  stats?: string;     // "2 gol • 1 asist"
  overall?: number;   // 0-100 / 0-5 normalize edilmemiş
};

// farklı kaynaklardan tek tipe dönüştür
function toUiPlayers(players: any[] | undefined | null): UiPlayer[] {
  if (!Array.isArray(players)) return [];

  const getInitials = (full?: string | null, fallback?: string) => {
    const s = (full ?? "").trim();
    if (s) {
      const parts = s.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (fallback ?? "??").slice(0, 2).toUpperCase();
  };

  return players.map((p: any) => {
    // 1) klasik: { id, name, team, overall?, avatarUrl? }
    // 2) sonuç:  { userId, teamLabel, rating, goals, assists, ... }
    const id = String( p.userId ?? "");
    const team = (p.team ?? p.teamLabel ?? "A") as "A" | "B";

    const name =
      (p.name as string) ??
      (p.displayName as string) ??
      (p.userName as string) ??
      `Oyuncu ${id.slice(-4)}`;

    const initials = getInitials(name, id);
    const avatarUrl = p.avatarUrl ?? null;

    const goals = typeof p.goals === "number" ? p.goals : null;
    const assists = typeof p.assists === "number" ? p.assists : null;
    const mini: string[] = [];
    if (goals && goals > 0) mini.push(`${goals} gol`);
    if (assists && assists > 0) mini.push(`${assists} asist`);
    const stats = mini.length ? mini.join(" • ") : undefined;

    const overall =
      typeof p.overall === "number"
        ? p.overall
        : typeof p.rating === "number"
        ? p.rating
        : undefined;

    return { id, name, initials, team, avatarUrl, stats, overall };
  });
}

export default function MatchFeedbackPage() {
  if (DEBUG) performance.mark("mf:render:start");

  const { id: routeId } = useParams<{ id: string }>();
  const id = routeId ?? "";

  // Çalışan hook: /api/matches/[id] üzerinden match + participants + (bazı durumlarda players)
  const { wallet, match, players: hookPlayers, loading, err } = useMatchDetail(id);

  // Yedek: oyuncu sonuçlarını doğrudan backend'ten çek (authFetch)
  const [extraPlayers, setExtraPlayers] = useState<any[] | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  useEffect(() => {
    let mounted = true;
    // hookPlayers boşsa yedek endpoint'i çağır
    if (!id || (Array.isArray(hookPlayers) && hookPlayers.length > 0)) return;

    (async () => {
      try {
        setLoadingPlayers(true);
        const res = await authFetch(`/v1/match-player-results/match/${id}`, { method: "GET" });
        if (!res.ok) {
          dbg("players:authFetch !ok", { status: res.status });
          return;
        }
        const data = await res.json().catch(() => []);
        if (mounted) setExtraPlayers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        dbg("players:authFetch error", e?.message || String(e));
      } finally {
        if (mounted) setLoadingPlayers(false);
      }
    })();

    return () => { mounted = false; };
  }, [id, hookPlayers]);

  // birleşik oyuncu listesi
  const rawPlayers = (hookPlayers && hookPlayers.length > 0) ? hookPlayers : (extraPlayers ?? []);
  const uiPlayers = useMemo(() => toUiPlayers(rawPlayers), [rawPlayers]);

  // Takım filtresi
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("all");
  const filteredPlayers = useMemo(() => {
    if (teamFilter === "all") return uiPlayers;
    return uiPlayers.filter((p) => p.team === teamFilter);
  }, [uiPlayers, teamFilter]);

  // Debug izleme
  const prev = useRef<{ loading?: boolean; err?: string | null }>({});
  useEffect(() => { dbg("mount", { id, env_debug: DEBUG, time: new Date().toISOString() }); return () => dbg("unmount", { id }); }, [id]);
  useEffect(() => { if (prev.current.loading !== loading) { dbg("state:loading", { from: prev.current.loading, to: loading }); prev.current.loading = loading; }}, [loading]);
  useEffect(() => { if (prev.current.err !== err) { dbg("state:error", { from: prev.current.err, to: err }); prev.current.err = err ?? null; }}, [err]);
  useEffect(() => { if (match) dbg("data:match", { id: match.id, city: match.city, ts: match.matchTimestamp }); }, [match]);
  useEffect(() => { if (rawPlayers) dbg("data:players(raw)", { count: rawPlayers.length, sample: rawPlayers.slice(0, 3) }); }, [rawPlayers]);
  useEffect(() => { if (uiPlayers) dbg("data:players(ui)", { count: uiPlayers.length, sample: uiPlayers.slice(0, 3) }); }, [uiPlayers]);
  useEffect(() => { if (wallet !== null) dbg("data:wallet", { wallet }); }, [wallet]);

  if (DEBUG) {
    performance.mark("mf:render:end");
    performance.measure("mf:render", "mf:render:start", "mf:render:end");
    const m = performance.getEntriesByName("mf:render").slice(-1)[0];
    if (m) dbg("perf:render", { took_ms: Math.round(m.duration) });
  }

  // Hero alanı için güvenli alanlar (API alan adlarıyla uyumlu)
  const startISO = match?.matchTimestamp ? new Date(match.matchTimestamp) : null;
  const dateText = startISO
    ? startISO.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
    : "—";
  const timeText = startISO
    ? startISO.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="page-wrap">
      {/* Üst bar — MatchDetail ile uyumlu */}
      <header className="topbar">
        <div className="topbar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href={`/past-matches`} className="logo-link">←</Link>
            <Link href="/" className="logo-link">MaçBul</Link>
          </div>
          <div className="user-info">
            <Link href="/wallet" className="balance">
              {wallet !== null ? formatTL(wallet) : "₺--,--"}
            </Link>
            <div className="avatar">AY</div>
          </div>
        </div>
      </header>

      <div className="container-xl">
        {err && (
          <div className="empty" style={{ color: "#b02a37", marginTop: 12 }}>
            <strong>Hata:</strong> {err}
          </div>
        )}

        {loading || !match ? (
          <div className="empty">
            <div className="spinner" />
            <p style={{ marginTop: 12, color: "#6c757d" }}>Yükleniyor…</p>
          </div>
        ) : (
          <main className="match-feedback-container">
            {/* HERO */}
            <section className="match-feedback-hero">
              <div className="match-feedback-hero-head">
                <div>
                  <h1 className="match-feedback-hero-title">
                    {match.fieldName || "Halı Saha"}
                    {match.city ? ` • ${match.city}` : ""}
                    {match.districtName ? ` / ${match.districtName}` : ""}
                  </h1>

                  <div className="match-feedback-meta">
                    <span>📅 <strong>{dateText}</strong></span>
                    <span>⏰ <strong>{timeText}</strong></span>
                    <span>📍 <strong>{match.fieldName || "Halı Saha"}</strong></span>
                  </div>
                </div>
              </div>
            </section>


            <div className="match-feedback-grid">
              {/* SOL: Oyuncu kartları */}
              <section className="match-feedback-card">
                <h2 className="match-feedback-card-title">👥 Oyuncuları Oyla &amp; Yorumla</h2>
                <p className="match-feedback-sub">
                  Her oyuncu için yıldız ve kısa yorum bırak. Her oyuncu geri bildirimi <strong>ayrı ayrı</strong> gönderilir.
                </p>

                <div className="match-feedback-team-toggle" id="teamToggle">
                  <button
                    className={`match-feedback-team-btn ${teamFilter === "all" ? "match-feedback-active" : ""}`}
                    onClick={() => setTeamFilter("all")}
                  >
                    Tüm Oyuncular
                  </button>
                  <button
                    className={`match-feedback-team-btn ${teamFilter === "A" ? "match-feedback-active" : ""}`}
                    onClick={() => setTeamFilter("A")}
                  >
                    Takım A
                  </button>
                  <button
                    className={`match-feedback-team-btn ${teamFilter === "B" ? "match-feedback-active" : ""}`}
                    onClick={() => setTeamFilter("B")}
                  >
                    Takım B
                  </button>
                </div>

                {loadingPlayers && rawPlayers.length === 0 ? (
                  <div className="empty" style={{ padding: 16 }}>
                    <div className="spinner" />
                    <p style={{ marginTop: 8, color: "#6c757d" }}>Oyuncular yükleniyor…</p>
                  </div>
                ) : (
                  <div id="players">
                    {filteredPlayers.map((p) => (
                      <PlayerFeedbackCard key={p.id} player={p} matchId={match.id} />
                    ))}
                    {filteredPlayers.length === 0 && (
                      <div className="empty" style={{ padding: 12 }}>
                        Listelenecek oyuncu bulunamadı.
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* SAĞ: Özet */}
              <aside className="match-feedback-card match-feedback-sticky">
                <SummaryCard playersCount={uiPlayers.length} />
              </aside>
            </div>

            {/* Maç (sistem) geri bildirimi */}
            <section className="match-feedback-card" style={{ marginTop: "1rem" }}>
              <h2 className="match-feedback-card-title">📋 Maçla İlgili Geri Bildirim</h2>
              <p className="match-feedback-sub">Organizasyon, saha ve uygulama deneyimi hakkında genel değerlendirmeni bırak.</p>
              <MatchFeedbackPanel matchId={match.id} />
            </section>
          </main>
        )}
      </div>
    </div>
  );
}
