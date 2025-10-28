"use client";

export default function PerformanceCard({ ratings }: { ratings: number[] }) {
  return (
    <div className="card-profile">
      <div className="performance-header">
        <div className="card-title">📈 Son Maç Puanları</div>
      </div>

      {ratings.length === 0 ? (
        <div className="performance-empty">Henüz maç verisi bulunamadı.</div>
      ) : (
        <ul className="performance-list">
          {ratings.map((r, i) => (
            <li key={i} className="performance-item">
              <span className="match-label">{i + 1}. Maç: </span>
              <span className="match-score">{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
