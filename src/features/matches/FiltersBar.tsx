"use client";

export type Filters = {
  q: string;
  date: "all" | "today" | "tomorrow" | "week";
  price: "all" | "0-50" | "50-100" | "100+";
  status: "all" | "available" | "filling" | "full";
};

export default function FiltersBar({
  filters,
  onChange,
  view,
  setView,
}: {
  filters: Filters;
  onChange: (p: Partial<Filters>) => void;
  view: "list" | "map";
  setView: (v: "list" | "map") => void;
}) {
  return (
    <div className="search-filter-bar">
      <div className="search-row">
        <input
          className="input search-input"
          placeholder="Saha adı veya konum ara..."
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
        <div className="view-toggle">
          <button
            className={`view-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
            type="button"
          >
            📋 Liste
          </button>
          <button
            className={`view-btn ${view === "map" ? "active" : ""}`}
            onClick={() => { setView("map"); alert("Harita görünümü yakında!"); }}
            type="button"
          >
            🗺️ Harita
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Tarih</label>
          <select
            className="select filter-select"
            value={filters.date}
            onChange={(e) => onChange({ date: e.target.value as Filters["date"] })}
          >
            <option value="all">Tüm Tarihler</option>
            <option value="today">Bugün</option>
            <option value="tomorrow">Yarın</option>
            <option value="week">Bu Hafta</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Fiyat</label>
          <select
            className="select filter-select"
            value={filters.price}
            onChange={(e) => onChange({ price: e.target.value as Filters["price"] })}
          >
            <option value="all">Tüm Fiyatlar</option>
            <option value="0-50">₺0 - ₺50</option>
            <option value="50-100">₺50 - ₺100</option>
            <option value="100+">₺100+</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Durum</label>
          <select
            className="select filter-select"
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as Filters["status"] })}
          >
            <option value="all">Tümü</option>
            <option value="available">Müsait</option>
            <option value="filling">Dolmak Üzere</option>
            <option value="full">Dolu</option>
          </select>
        </div>
      </div>
    </div>
  );
}
