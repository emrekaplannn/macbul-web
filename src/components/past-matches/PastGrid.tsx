// components/past-matches/PastGrid.tsx
"use client";

import type { PastMatchItem } from "@/lib/past-matches/types";

function headerClass(it: PastMatchItem) {
  if (it.winningTeam === "DRAW") return "draw";
  return it.winningTeam === it.team ? "win" : "loss";
}

export default function PastGrid({ items }: { items: PastMatchItem[] }) {
  return (
    <div className="past-matches-grid">
      {items.map((m) => {
        const d = new Date(m.time);

        // 🔥 Şehir + İlçe birleşimi
        const location = m.districtName
          ? `${m.city} / ${m.districtName}`
          : (m.city || "—");

        return (
          <a
            key={m.matchId}
            href={`/matches/${m.matchId}/feedback`}
            className="past-matches-card"
          >
            <div className={`past-matches-card-head ${headerClass(m)}`}>
              <div className="past-matches-card-date">
                {d.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
                {" • "}
                {d.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="past-matches-card-result">
                {m.scoreA}-{m.scoreB}
              </div>
            </div>

            <div className="past-matches-card-body">
              <div className="past-matches-card-venue">{m.venue}</div>

              {/* 🔥 Güncellenmiş location alanı */}
              <div className="past-matches-card-location">
                📍 {location}
              </div>

              <div className="past-matches-card-stats">
                <span className="chip">⚽ {m.goals} Gol</span>
                <span className="chip">🎯 {m.assists} Asist</span>
                <span className="chip">⭐ {m.rating ?? "-"}</span>
                {m.mvp && <span className="chip">🏆 MotM</span>}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
