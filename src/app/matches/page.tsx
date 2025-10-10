"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MatchCard from "@/features/matches/MatchCard";
import type { MatchItem } from "@/features/matches/types";
import FiltersBar, { Filters } from "@/features/matches/FiltersBar";

const DEBUG = true;

function fromTsForFilter(date: Filters["date"]) {
  const now = new Date();
  if (date === "all") return now.getTime(); // Tümü için geçmişi de görmek istersen: return 0;
  if (date === "today") { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); }
  if (date === "tomorrow") { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(0,0,0,0); return d.getTime(); }
  if (date === "week") { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); }
  return now.getTime();
}

export default function MatchesPage() {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [serverError, setServerError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    q: "",
    date: "all",
    price: "all",
    status: "all",
  });

  useEffect(() => {
    let alive = true;
    const payload = { fromTimestamp: fromTsForFilter(filters.date) };

    (async () => {
      setLoading(true);
      setServerError(null);
      const t0 = performance.now();
      const label = `[matches] fetch ${new Date().toISOString()}`;
      try {
        DEBUG && console.groupCollapsed(label);
        DEBUG && console.log("→ request payload", payload);

        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });

        const text = await res.text();
        let data: any = {};
        try { data = JSON.parse(text); } catch { data = { raw: text }; }

        const t1 = performance.now();
        DEBUG && console.log("← status", res.status, res.statusText, `(${(t1 - t0).toFixed(1)}ms)`);
        DEBUG && console.log("← response body", data);

        if (!res.ok) {
          if (alive) {
            setItems([]);
            setServerError(typeof data?.message === "string" ? data.message : `Hata: ${res.status}`);
          }
          return;
        }

        const got: MatchItem[] = data.items ?? [];
        if (alive) setItems(got);

        if (DEBUG) {
          const dates: number[] = got.map((m: MatchItem) => new Date(m.isoDate).getTime());
          const firstIso = dates.length ? new Date(Math.min(...dates)).toISOString() : "(none)";
          const lastIso  = dates.length ? new Date(Math.max(...dates)).toISOString() : "(none)";
          console.log("itemCount", got.length, "first", firstIso, "last", lastIso);
        }
      } catch (e) {
        DEBUG && console.error("fetch error", e);
        if (alive) {
          setItems([]);
          setServerError(e instanceof Error ? e.message : "İstek hatası");
        }
      } finally {
        const t2 = performance.now();
        DEBUG && console.log("done in", `${(t2 - t0).toFixed(1)}ms since request start`);
        DEBUG && console.groupEnd();
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [filters.date]);

  const filtered = useMemo(() => {
    const now = new Date();
    const out = items.filter((m) => {
      const hay = (m.venueName + " " + m.city).toLowerCase();
      const okQ = hay.includes(filters.q.toLowerCase());

      let okWeek = true;
      if (filters.date === "week") {
        const dt = new Date(m.isoDate);
        const limit = new Date(now); limit.setDate(limit.getDate()+7);
        okWeek = dt >= now && dt <= limit;
      }

      let okPrice = true;
      if (filters.price === "0-50") okPrice = m.price <= 50;
      else if (filters.price === "50-100") okPrice = m.price > 50 && m.price <= 100;
      else if (filters.price === "100+") okPrice = m.price > 100;

      const okStatus = filters.status === "all" || m.status === filters.status;
      return okQ && okWeek && okPrice && okStatus;
    });

    DEBUG && console.debug("[matches] client filter",
      { q: filters.q, date: filters.date, price: filters.price, status: filters.status,
        before: items.length, after: out.length });

    return out;
  }, [items, filters]);

  const stats = useMemo(() => {
    const open = items.filter((m) => m.status !== "full").length;
    const today = items.filter((m) => {
      const d = new Date(m.isoDate);
      const t = new Date(); return d.toDateString() === t.toDateString();
    }).length;
    const nearby = items.filter((m) => m.city.toLowerCase().includes("istanbul")).length;
    return { open, today, nearby };
  }, [items]);

  function handleJoin(m: MatchItem) {
    if (m.status === "full") return;
    alert(`"${m.venueName}" maçı için katılım akışı başlatılıyor…`);
  }
  function handleOpen(m: MatchItem) {
    console.log("Go match detail:", m.id, m);
  }

  return (
    <div className="page-wrap">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="logo-link">MaçBul</Link>
          <div className="user-info">
            <div className="balance">₺120,50</div>
            <div className="avatar">AY</div>
          </div>
        </div>
      </header>

      <div className="container-xl">
        <div className="page-header">
          <h1>Maçları Keşfet</h1>
          <p>Yakınındaki açık maçları bul ve hemen katıl</p>
        </div>

        <FiltersBar
          filters={filters}
          onChange={(p) => {
            DEBUG && console.log("[filters] change", p);
            setFilters((s) => ({ ...s, ...p }));
          }}
          view={view}
          setView={(v) => {
            DEBUG && console.log("[view] change", v);
            setView(v);
          }}
        />

        <div className="stats-bar">
          <div className="stat-chip"><span>{stats.open}</span> Açık Maç</div>
          <div className="stat-chip"><span>{stats.today}</span> Bugün</div>
          <div className="stat-chip"><span>{stats.nearby}</span> Yakınınızda</div>
        </div>

        {serverError && (
          <div className="empty" style={{ color: "#b02a37", marginTop: 12 }}>
            <strong>Sunucu Hatası:</strong> {serverError}
          </div>
        )}

        {loading ? (
          <div className="empty">
            <div className="spinner"></div>
            <p style={{ marginTop: 12, color: "#6c757d" }}>Yükleniyor…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h3>Maç bulunamadı</h3>
            <p>Filtreleri değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
          <div className="matches-grid">
            {filtered.map((m) => (
              <MatchCard key={m.id} m={m} onJoin={handleJoin} onOpen={handleOpen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
