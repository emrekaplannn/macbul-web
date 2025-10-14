"use client";
import type { MatchDto } from "./types";

export default function VenueCard({ match }: { match: MatchDto }) {
  return (
    <div className="card">
      <h2 className="card-title">🏟️ Saha Bilgileri</h2>

      <div className="venue-details">
        <div className="detail-row"><div className="detail-icon">⚽</div><div><div className="detail-label">Saha</div><div className="detail-value">Halı Saha</div></div></div>
        <div className="detail-row"><div className="detail-icon">⏱️</div><div><div className="detail-label">Süre</div><div className="detail-value">60 Dakika</div></div></div>
        <div className="detail-row"><div className="detail-icon">👥</div><div><div className="detail-label">Kapasite</div><div className="detail-value">{match.totalSlots} oyuncu</div></div></div>
        <div className="detail-row"><div className="detail-icon">🏢</div><div><div className="detail-label">Adres</div><div className="detail-value">{match.address || "—"}</div></div></div>
      </div>

      <div className="map-container">
        <div className="map-placeholder">
          <div style={{ fontSize: "3rem", marginBottom: ".5rem" }}>🗺️</div>
          <div>Harita Görünümü</div>
          {match.address && <div style={{ fontSize: ".85rem", marginTop: ".5rem" }}>{match.address}</div>}
        </div>
      </div>
    </div>
  );
}
