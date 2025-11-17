// components/past-matches/PastTimeline.tsx
"use client";

import type { PastMatchItem } from "@/lib/past-matches/types";

function resultClass(it: PastMatchItem) {
  if (it.winningTeam === "DRAW") return "draw";
  return it.winningTeam === it.team ? "win" : "loss";
}

export default function PastTimeline({ items }: { items: PastMatchItem[] }) {
  return (
    <div className="past-matches-timeline">
      {items.map((m) => {
        const d = new Date(m.time);
        const resLabel = m.winningTeam === "DRAW" ? "Berabere" : (m.winningTeam === m.team ? "Kazanıldı" : "Kaybedildi");
        return (
          <a key={m.matchId} href={`/matches/${m.matchId}/feedback`} className={`past-matches-timeline-item ${resultClass(m)}`}>
            <div className="past-matches-match-row">
              <div className="past-matches-match-left">
                <div className="past-matches-datetime">
                  <span>📅 {d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  <span>⏰ {d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="past-matches-venue">{m.venue}</div>
                <div className="past-matches-location">📍 {m.city || "—"}</div>
              </div>

              <div className="past-matches-match-right">
                <div className={`past-matches-result-badge ${resultClass(m)}`}>{resLabel} {m.scoreA}-{m.scoreB}</div>
                <div className="past-matches-rating">
                  <span>⭐</span>
                  <span>{m.rating ?? "-"}</span>
                </div>
              </div>
            </div>

            <div className="past-matches-details-row">
              <div className="past-matches-detail">
                <div className="label">Pozisyon</div>
                <div className="value">{m.position ? `⚽ ${m.position}` : "—"}</div>
              </div>
              <div className="past-matches-detail">
                <div className="label">Süre</div>
                <div className="value">⏱️ {m.durationMin} dk</div>
              </div>
              <div className="past-matches-detail">
                <div className="label">Kişisel</div>
                <div className="value chips">
                  <span className="chip">⚽ {m.goals} Gol</span>
                  <span className="chip">🎯 {m.assists} Asist</span>
                  {m.mvp && <span className="chip">🏆 MotM</span>}
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
