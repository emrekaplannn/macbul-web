"use client";
import type { MatchParticipantDto, MatchSlotsDto, MatchDto } from "./types";

export default function PlayersCard({ players, slots, match }: {
  players: MatchParticipantDto[];
  slots: MatchSlotsDto | null;
  match: MatchDto;
}) {
  return (
    <div className="card">
      <div className="players-header">
        <h2 className="card-title" style={{ marginBottom: 0 }}>👥 Katılımcılar</h2>
        <div className="players-count">
          {(slots?.paidCount ?? 0)}/{slots?.totalSlots ?? match.totalSlots} Oyuncu
        </div>
      </div>

      {players.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗒️</div>
          Henüz katılımcı yok
        </div>
      ) : (
        <div className="player-list">
          {players.map((p) => {
            const initials = (p.userId || "U?")
              .split(/\s|_/).map(s => s.trim()[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
            return (
              <div key={p.id} className="player-card">
                <div className="player-avatar">{initials || "U"}</div>
                <div className="player-info">
                  <div className="player-name">Kullanıcı #{p.userId?.slice?.(0, 6) ?? "?"}</div>
                  <div className="player-stats">{p.hasPaid ? "Ödeme yapıldı" : "Ödeme bekleniyor"}</div>
                </div>
                <div className="player-overall">
                  {p.hasPaid ? "PAID" : "PENDING"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {slots && slots.remaining > 0 && (
        <div className="empty-slots">
          {Array.from({ length: slots.remaining }).map((_, i) => (
            <div key={`empty-${i}`} className="empty-slot">💭 Boş Pozisyon</div>
          ))}
        </div>
      )}
    </div>
  );
}
