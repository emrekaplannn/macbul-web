// app/(app)/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import OverallCard from "@/components/profile/OverallCard";
import StatsCard from "@/components/profile/StatsCard";
import WalletCard from "@/components/profile/WalletCard";
import RecentMatchesCard from "@/components/profile/RecentMatchesCard";
import PerformanceCard from "@/components/profile/PerformanceCard";
import { ProfileApiResponse } from "@/lib/profile/types";
import { authFetch } from "@/lib/authFetch";

// ---- Debug helpers ---------------------------------------------------------
const DEBUG = true; // dilersen env’e bağlayabilirsin
const MASK = (v?: string | null, keep = 8) =>
  !v ? "<none>" : `${String(v).slice(0, keep)}…(len=${String(v).length})`;

function group(title: string, fn: () => void) {
  if (!DEBUG) return fn();
  try {
    console.groupCollapsed(`%c${title}`, "color:#0aa; font-weight:600");
    fn();
  } finally {
    console.groupEnd();
  }
}

async function parseJsonSafe<T = any>(res: Response) {
  try {
    return (await res.clone().json()) as T;
  } catch {
    return null as unknown as T;
  }
}
async function readTextSafe(res: Response) {
  try {
    return await res.clone().text();
  } catch {
    return "";
  }
}
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const [data, setData] = useState<ProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const t0 = performance.now();
      setLoading(true);
      setErr(null);

      group("[PROFILE] fetch /api/profile", () => {
        console.log("start", {
          time: new Date().toISOString(),
          location: typeof window !== "undefined" ? window.location.href : "(ssr)",
        });
      });

      try {
        // authFetch wallet’taki akışla aynı: header/cookie forward + 401’de refresh
        const res = await authFetch("/api/profile", { cache: "no-store" });

        const status = res.status;
        const ok = res.ok;
        const ct = res.headers.get("content-type") || "";
        const www = res.headers.get("www-authenticate") || "";
        const cache = res.headers.get("cache-control") || "";

        group("[PROFILE] response meta", () => {
          console.log("status", status, "ok", ok);
          console.log("headers", { "content-type": ct, "www-authenticate": www ? MASK(www) : "<empty>", "cache-control": cache });
        });

        // Başarısızsa text önizleme ile dön
        if (!ok) {
          const textPreview = (await readTextSafe(res)).slice(0, 400);
          const took = Math.round(performance.now() - t0);
          group("[PROFILE] error details", () => {
            console.log("preview", textPreview || "<empty>");
            console.log("took_ms", took);
          });
          throw new Error(textPreview || `Profil yüklenemedi (${status})`);
        }

        // JSON parse
        const json = await parseJsonSafe<ProfileApiResponse>(res);
        const took = Math.round(performance.now() - t0);

        // Basit şema kontrolleri (hızlı geri bildirim için)
        const hasMe = json && typeof json === "object" && (json as any).me;
        const hasStats = json && (json as any).stats;
        const hasRecent = Array.isArray((json as any)?.recent);
        const hasTrend = Array.isArray((json as any)?.trend);

        group("[PROFILE] payload summary", () => {
          console.log("took_ms", took);
          console.log("keys", json ? Object.keys(json) : "<null>");
          console.log("me", hasMe ? { id: (json as any).me?.id, email: (json as any).me?.email } : "<missing>");
          console.log("stats", hasStats ? (json as any).stats : "<missing>");
          console.log("recent_len", hasRecent ? (json as any).recent.length : 0);
          console.log("trend_len", hasTrend ? (json as any).trend.length : 0);
        });

        if (!hasMe || !hasStats) {
          throw new Error("Eksik profil verisi: 'me' veya 'stats' yok");
        }

        if (alive) setData(json);
        group("[PROFILE] success", () => {
          console.log("ok", { meId: (json as any).me?.id, overall: (json as any).stats?.overall, took_ms: took });
        });
      } catch (e: any) {
        const took = Math.round(performance.now() - t0);
        if (alive) setErr(e?.message ?? "Hata");
        group("[PROFILE] fail", () => {
          console.log("message", e?.message);
          console.log("stack", e?.stack?.split("\n").slice(0, 3).join("\n") ?? "<no-stack>");
          console.log("took_ms", took);
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  // ---- UI states
  if (loading) {
    return (
      <div className="page-wrap-profile">
        <div className="empty-profile">
          <div className="spinner-profile"></div>
          <p style={{ marginTop: 12, color: "#6c757d" }}>Profil yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="page-wrap-profile">
        <div className="empty-profile" style={{ color: "#b02a37" }}>
          <strong>Hata:</strong> {err ?? "Profil verisi alınamadı"}
          <details style={{ marginTop: 8, color: "#6c757d" }}>
            <summary>Detay</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>
{`İstek: GET /api/profile
Olası Nedenler:
• Oturum süresi dolmuş (401) ve refresh başarısız.
• API_BASE_URL/env yanlış.
• API /v1/profile/me endpoint hatası.
• JSON gövdesi beklenmedik formatta.

Çözüm:
• Tarayıcı çerezlerini kontrol et (access_token/refresh_token).
• /api/profile ve /v1/auth/refresh loglarını incele.
• Sunucu loglarındaki 401/403/5xx kayıtlarını kontrol et.`}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // ---- Normal render
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
          <a href="/" className="text-2xl font-bold text-[#17a2b8]">MaçBul</a>
          <div className="hidden md:flex items-center gap-8">
            <a href="/matches" className="font-medium text-gray-700 hover:text-[#17a2b8]">Maçlar</a>
            <a href="/profile" className="font-semibold text-[#17a2b8]">Profilim</a>
            <a href="/settings" className="font-medium text-gray-700 hover:text-[#17a2b8]">Ayarlar</a>
          </div>
        </nav>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        <ProfileHeader data={data} />
        <ProfileTabs tabs={["📊 Genel Bakış", "💳 Cüzdan", "⚽ Maç Geçmişi", "📈 İstatistikler"]} />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OverallCard overall={data.stats.overall} trendDeltaLabel="+5 Son 10 Maç" />
          <StatsCard stats={data.stats} />
          <WalletCard />
          <RecentMatchesCard recent={data.recent} />
          <div className="lg:col-span-2">
            <PerformanceCard ratings={data.trend} />
          </div>
        </section>
      </main>
    </div>
  );
}
