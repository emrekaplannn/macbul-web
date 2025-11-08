// components/past-matches/PastFilters.tsx
"use client";

type Props = {
  range: string; result: string; venue: string; venues: string[];
  onApply: (range: string, result: string, venue: string) => void;
};

export default function PastFilters({ range, result, venue, venues, onApply }: Props) {
  return (
    <div className="past-matches-filters-card">
      <div className="past-matches-filters-row">
        <div className="past-matches-filter">
          <label className="past-matches-filter-label">Tarih Aralığı</label>
          <select
            className="past-matches-filter-input"
            value={range}
            onChange={(e) => onApply(e.target.value, result, venue)}
          >
            <option value="ALL">Tüm Zamanlar</option>
            <option value="7D">Son 7 Gün</option>
            <option value="30D">Son 30 Gün</option>
            <option value="3M">Son 3 Ay</option>
            <option value="6M">Son 6 Ay</option>
            <option value="YTD">Bu Yıl</option>
          </select>
        </div>

        <div className="past-matches-filter">
          <label className="past-matches-filter-label">Sonuç</label>
          <select
            className="past-matches-filter-input"
            value={result}
            onChange={(e) => onApply(range, e.target.value, venue)}
          >
            <option value="ALL">Tümü</option>
            <option value="WIN">Kazanılan</option>
            <option value="LOSS">Kaybedilen</option>
            <option value="DRAW">Berabere</option>
          </select>
        </div>

        <div className="past-matches-filter">
          <label className="past-matches-filter-label">Saha</label>
          <select
            className="past-matches-filter-input"
            value={venue}
            onChange={(e) => onApply(range, result, e.target.value)}
          >
            {venues.map((v) => <option key={v} value={v}>{v === "ALL" ? "Tüm Sahalar" : v}</option>)}
          </select>
        </div>

        <button className="past-matches-filter-btn" onClick={() => onApply(range, result, venue)}>Filtrele</button>
      </div>
    </div>
  );
}
