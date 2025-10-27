type Props = {
  stats: { totalMatches: number; goals: number; assists: number; avgRating: number | null; motm: number };
};

export default function StatsCard({ stats }: Props) {
  const items = [
    { v: stats.totalMatches, l: "Toplam Maç" },
    { v: stats.goals, l: "Gol" },
    { v: stats.assists, l: "Asist" },
    { v: `${stats.avgRating ?? "-"}`, l: "Ortalama Puan" },
    { v: stats.motm, l: "MotM" },
  ];

  return (
    <div className="card-profile">
      <div className="card-title">📊 İstatistikler</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((it, i) => (
          <div key={i} className="stat-box">
            <div className="stat-box-value">{it.v}</div>
            <div className="stat-box-label">{it.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
