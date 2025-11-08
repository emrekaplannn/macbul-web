// components/past-matches/PastSummary.tsx
"use client";

export default function PastSummary(props: {
  total: number; wins: number; losses: number; draws: number;
  goals: number; assists: number; avgRating: number | null; successRate: number;
}) {
  const cards = [
    { icon: "⚽", value: props.total, label: "Toplam Maç", trend: null },
    { icon: "🏆", value: props.wins, label: "Kazanılan", trend: `${props.successRate}% Başarı` },
    { icon: "➖", value: props.draws, label: "Berabere", trend: null },
    { icon: "📉", value: props.losses, label: "Kaybedilen", trend: null },
    { icon: "⭐", value: props.goals, label: "Toplam Gol", trend: null },
    { icon: "🎯", value: props.assists, label: "Toplam Asist", trend: null },
    { icon: "📈", value: props.avgRating ?? "-", label: "Ortalama Puan", trend: null },
  ];

  return (
    <div className="past-matches-sumcards">
      {cards.map((c, i) => (
        <div key={i} className="past-matches-sumcard">
          <div className="past-matches-sumicon">{c.icon}</div>
          <div className="past-matches-sumvalue">{c.value}</div>
          <div className="past-matches-sumlabel">{c.label}</div>
          {c.trend && <div className="past-matches-sumtrend">{c.trend}</div>}
        </div>
      ))}
    </div>
  );
}
