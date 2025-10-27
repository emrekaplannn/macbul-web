export default function OverallCard({ overall, trendDeltaLabel }: { overall: number; trendDeltaLabel: string }) {
  const percent = Math.max(0, Math.min(100, overall));
  return (
    <div className="card-profile">
      <div className="card-title">🎯 Overall Puanı</div>

      <div className="text-center">
        <div
          className="overall-ring"
          style={{ background: `conic-gradient(#17a2b8 0% ${percent}%, #e0e0e0 ${percent}% 100%)` }}
        >
          <div className="overall-inner">
            <div className="overall-score">{overall}</div>
            <div className="text-xs text-gray-500 mt-1">Overall</div>
          </div>
        </div>

        <p className="text-gray-500 mb-3">Performansın harika! Oyun seviyeni korumaya devam et.</p>
        <span className="trend-label">↗️ {trendDeltaLabel}</span>
      </div>
    </div>
  );
}
