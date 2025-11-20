// app/(app)/past-matches/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { PastMatchesResponse, PastMatchItem } from "@/lib/past-matches/types";
import PastSummary from "@/components/past-matches/PastSummary";
import PastFilters from "@/components/past-matches/PastFilters";
import PastTimeline from "@/components/past-matches/PastTimeline";
import PastGrid from "@/components/past-matches/PastGrid";

type ViewMode = "timeline" | "grid";

const DEBUG = true;

export default function PastMatchesPage() {
  const [data, setData] = useState<PastMatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [range, setRange] = useState("ALL");
  const [result, setResult] = useState("ALL");
  const [venue, setVenue] = useState("ALL");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>("timeline");

  async function load() {
    setLoading(true); setErr(null);
    const qs = new URLSearchParams({ range, result, venue, page: String(page), pageSize: "10" });
    try {
      const res = await authFetch(`/api/past-matches?${qs.toString()}`, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.message || "Geçmiş alınamadı");
      setData(j as PastMatchesResponse);
      DEBUG && console.log("[PAST] ok", j);
    } catch (e: any) {
      setErr(e?.message ?? "Hata");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [range, result, venue, page]);

  const venues = useMemo(() => {
    const set = new Set<string>();
    (data?.items ?? []).forEach(m => set.add(m.venue));
    return ["ALL", ...Array.from(set)];
  }, [data?.items]);

  return (
    <div className="past-matches-page">
      <header className="past-matches-header">
        <nav className="past-matches-nav">
          <a href="/" className="past-matches-logo">MaçBul</a>
          <div className="past-matches-links">
            <a href="/">Maçlar</a>
            <a href="/past-matches" className="active">Geçmişim</a>
            <a href="/profile">Profilim</a>
          </div>
        </nav>
      </header>

      <main className="past-matches-container">
        <div className="past-matches-page-header">
          <div>
            <h1>⚽ Maç Geçmişim</h1>
            <p>Oynadığın tüm maçları görüntüle ve performansını takip et</p>
          </div>
          <div className="past-matches-actions">
            <button className="past-matches-export" onClick={() => alert("Rapor hazırlama yakında")}>📊 Rapor Al</button>
          </div>
        </div>

        {/* Summary */}
        {data && (
          <PastSummary
            total={data.summary.totalMatches}
            wins={data.summary.wins}
            losses={data.summary.losses}
            draws={data.summary.draws}
            goals={data.summary.goals}
            assists={data.summary.assists}
            avgRating={data.summary.avgRating}
            successRate={data.summary.successRate}
          />
        )}

        {/* Filters */}
        <div className="past-matches-filters">
          <PastFilters
            range={range}
            result={result}
            venue={venue}
            venues={venues}
            onApply={(r, re, v) => { setPage(1); setRange(r); setResult(re); setVenue(v); }}
          />
        </div>

        {/* View header */}
        <div className="past-matches-timeline-head">
          <h2>Maç Geçmişi</h2>
          <div className="past-matches-view-toggle">
            <button className={`btn ${view === "timeline" ? "active" : ""}`} onClick={() => setView("timeline")}>📋 Zaman Çizelgesi</button>
            <button className={`btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>🎴 Kart Görünümü</button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="past-matches-empty">
            <div className="past-matches-spinner"></div>
            Yükleniyor…
          </div>
        ) : err ? (
          <div className="past-matches-empty error"><strong>Hata:</strong> {err}</div>
        ) : !data?.items?.length ? (
          <div className="past-matches-empty">
            <div className="past-matches-empty-icon">🗒️</div>
            <h3>Henüz maç bulunamadı</h3>
            <p>Filtreleri genişletmeyi deneyebilirsin.</p>
          </div>
        ) : view === "timeline" ? (
          <PastTimeline items={data.items} />
        ) : (
          <PastGrid items={data.items} />
        )}

        {/* Pagination */}
        {data && (data.hasPrev || data.hasNext) && (
          <div className="past-matches-pagination">
            <button className="btn" disabled={!data.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Önceki</button>
            <button className="btn active">{page}</button>
            <button className="btn" disabled={!data.hasNext} onClick={() => setPage((p) => p + 1)}>Sonraki →</button>
          </div>
        )}
      </main>
    </div>
  );
}
