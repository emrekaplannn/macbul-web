"use client";
import React from "react";

export default function SummaryCard({ playersCount }: { playersCount: number }) {
  const [rated, setRated] = React.useState(0);

  // Basit global listener: her oyuncu gönderiminde artırılabilir.
  React.useEffect(() => {
    const handler = () => setRated((x) => Math.min(playersCount, x + 1));
    window.addEventListener("player-feedback-sent", handler as any);
    return () => window.removeEventListener("player-feedback-sent", handler as any);
  }, [playersCount]);

  const pct = Math.round((rated / playersCount) * 100);

  return (
    <>
      <h2 className="match-feedback-card-title">🧾 Özet</h2>
      <div className="match-feedback-summary">
        <div className="match-feedback-row"><span className="match-feedback-muted">Toplam Oyuncu</span><strong>{playersCount}</strong></div>
        <div className="match-feedback-row"><span className="match-feedback-muted">Oylanan</span><strong>{rated}</strong></div>
        <div className="match-feedback-progress"><span style={{ width: `${pct}%` }} /></div>
      </div>
      <p className="match-feedback-note">⚠️ Her oyuncu ve maç geri bildirimi <b>ayrı ayrı</b> gönderilir.</p>
    </>
  );
}
