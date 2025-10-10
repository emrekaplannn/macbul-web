"use client";
import { MatchItem } from "./types";

function formatTL(v: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
}
function dayAndTime(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return { day, time };
}

export default function MatchCard({
  m,
  onJoin,
  onOpen,
}: {
  m: MatchItem;
  onJoin: (m: MatchItem) => void;
  onOpen: (m: MatchItem) => void;
}) {
  const { day, time } = dayAndTime(m.isoDate);
  const full = m.status === "full";

  return (
    <div className="card" onClick={() => onOpen(m)}>
      <div className="card-header">
        <div className="card-date">
          <span className="card-day">{day}</span>
          <span className="card-time">{time}</span>
        </div>
        <div className="card-price">{formatTL(m.price)}</div>
      </div>

      <div className="card-body">
        <h3 className="venue">{m.venueName}</h3>
        <div className="location">
          <span>📍</span>
          <span>{m.city}</span>
        </div>

        <div className="info-row">
          {/* Yüzey / süre backend'ten gelmediği için çıkardık */}
          <div className="info-item">
            <span className={`status ${m.status}`}>
              {m.status === "available" ? "Müsait" : m.status === "filling" ? "Dolmak Üzere" : "Dolu"}
            </span>
          </div>
          {m.isUserJoined && <div className="info-item">✅ Katıldın</div>}
        </div>

        <div className="card-footer">
          <div className="players">
            <span>👥</span>
            <span>{m.joined}/{m.capacity} Oyuncu</span>
          </div>
          <button
            className="btn-primary"
            disabled={full}
            onClick={(e) => { e.stopPropagation(); onJoin(m); }}
          >
            {full ? "Dolu" : "Katıl"}
          </button>
        </div>
      </div>
    </div>
  );
}
