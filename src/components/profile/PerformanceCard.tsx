"use client";

export default function PerformanceCard({ ratings }: { ratings: number[] }) {
  const max = Math.max(1, ...ratings);
  return (
    <div className="card-profile">
      <div className="flex items-center justify-between mb-3">
        <div className="card-title">📈 Overall Gelişimi</div>
        <select className="border-2 border-gray-200 rounded-md px-2 py-1 text-sm">
          <option>Son 10 Maç</option>
          <option>Son 20 Maç</option>
          <option>Tüm Zamanlar</option>
        </select>
      </div>

      <div className="h-64 flex items-end gap-2">
        {ratings.length === 0 && (
          <div className="empty-profile">Gösterilecek veri yok.</div>
        )}

        {ratings.map((r, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="bar w-full"
              style={{ height: `${(r / max) * 90 + 10}%` }}
              title={`Puan: ${r}`}
            >
              <span className="bar-value">{r}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">Maç {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
