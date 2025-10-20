"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { formatTL } from "@/lib/format";
import { useMatchDetail } from "@/features/match-detail/useMatchDetail";
import MatchHero from "@/features/match-detail/MatchHero";
import VenueCard from "@/features/match-detail/VenueCard";
import PlayersCard from "@/features/match-detail/PlayersCard";
import RulesCard from "@/features/match-detail/RulesCard";
import ActionSidebar from "@/features/match-detail/ActionSidebar";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const dbg = (...args: any[]) => { if (DEBUG) console.debug("[MatchDetail]", ...args); };

export default function MatchDetailPage() {
  if (DEBUG) performance.mark("md:render:start");

  const routeParams = useParams<{ id: string }>();
  const id = routeParams?.id ?? "";

  const { wallet, match, slots, players, priceNumber, loading, err, join } = useMatchDetail(id);

  const handleJoin = async () => {
    dbg("join:start", { id, priceNumber, wallet, slots });
    const t0 = DEBUG ? performance.now() : 0;
    try {
      const res = await join();
      const dt = DEBUG ? Math.round(performance.now() - t0) : 0;
      dbg("join:success", { res, took_ms: dt });
      return res;
    } catch (e) {
      const dt = DEBUG ? Math.round(performance.now() - t0) : 0;
      dbg("join:error", { error: e, took_ms: dt });
      throw e;
    }
  };

  useEffect(() => {
    dbg("mount", { id, env_debug: DEBUG, time: new Date().toISOString() });
    return () => dbg("unmount", { id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prev = useRef({ loading: undefined as undefined | boolean, err: undefined as undefined | string | null });

  useEffect(() => {
    if (prev.current.loading !== loading) {
      dbg("state:loading", { from: prev.current.loading, to: loading });
      prev.current.loading = loading;
    }
  }, [loading]);

  useEffect(() => {
    if (prev.current.err !== err) {
      dbg("state:error", { from: prev.current.err, to: err });
      prev.current.err = err;
    }
  }, [err]);

  useEffect(() => { if (match) dbg("data:match", { id: match.id, city: match.city, ts: match.matchTimestamp }); }, [match]);
  useEffect(() => { if (slots) dbg("data:slots", slots); }, [slots]);
  useEffect(() => { if (players) dbg("data:players", { count: players.length, sample: players.slice(0, 3) }); }, [players]);
  useEffect(() => { if (wallet !== null) dbg("data:wallet", { wallet }); }, [wallet]);

  const priceSafe = useMemo(() => {
    if (priceNumber != null) dbg("data:price", { priceNumber });
    return priceNumber ?? 0;
  }, [priceNumber]);

  if (DEBUG) {
    performance.mark("md:render:end");
    performance.measure("md:render", "md:render:start", "md:render:end");
    const m = performance.getEntriesByName("md:render").slice(-1)[0];
    if (m) dbg("perf:render", { took_ms: Math.round(m.duration) });
  }

  return (
    <div className="page-wrap">
      <header className="topbar">
        <div className="topbar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/matches" className="logo-link">←</Link>
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
          <>
            <MatchHero match={match} price={priceSafe} />

            <div className="content-2col" style={{ marginTop: "2rem" }}>
              <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <PlayersCard players={players} slots={slots} match={match} />
                <VenueCard match={match} />
                <RulesCard />
              </div>

              <div className="sidebar">
                <ActionSidebar match={match} slots={slots} price={priceSafe} onJoin={handleJoin} balance={wallet} />
                {/* Organizatör kartı kaldırıldı */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
