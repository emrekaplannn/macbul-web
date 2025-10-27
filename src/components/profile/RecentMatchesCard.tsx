"use client";

import { monthAbbrTR } from "@/lib/formatters";

type RecentItem = {
  matchId: string;
  fieldName: string;
  city: string;
  time: number;
  scoreA: number;
  scoreB: number;
  winningTeam: "A" | "B" | "DRAW";
  my: { goals: number; assists: number; rating: number | null; team: "A" | "B" };
};

export default function RecentMatchesCard({ recent }: { recent: RecentItem[] }) {
  return (
    <div className="card-profile">
      <div className="flex items-center justify-between mb-4">
        <div className="card-title">⚽ Son Maçlar</div>
        <a href="/matches" className="text-[#17a2b8] font-semibold text-sm">Tümünü Gör →</a>
      </div>

      <div className="flex flex-col gap-4">
        {recent.map((m) => {
          const d = new Date(m.time);
          const day = d.getDate();
          const mon = monthAbbrTR(d);
          const won = m.winningTeam === "DRAW" ? null : m.winningTeam === m.my.team;

          return (
            <a key={m.matchId} href={`/matches/${m.matchId}`} className="match-card">
              <div className={`match-date ${won === false ? "lost" : ""}`}>
                <div className="text-2xl font-bold leading-none">{day}</div>
                <div className="text-xs opacity-90">{mon}</div>
              </div>

              <div className="flex-1">
                <div className="font-semibold text-gray-800">{m.fieldName}</div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                  <span>📍 {m.city || "—"}</span>
                  <span>⚽ {m.my.goals} Gol, {m.my.assists} Asist</span>
                </div>

                <span
                  className={`match-result ${
                    won === null ? "draw" : won ? "win" : "lose"
                  } mt-2`}
                >
                  {m.winningTeam === "DRAW" ? "Berabere" : won ? "Kazanıldı" : "Kaybedildi"} {m.scoreA}-{m.scoreB}
                </span>
              </div>

              <div className="text-center w-16">
                <div className="text-yellow-500">
                  {"⭐".repeat(Math.max(1, Math.round((m.my.rating ?? 75) / 20)))}
                </div>
                <div className="text-xs text-gray-500 mt-1">{m.my.rating ?? "-"}</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
