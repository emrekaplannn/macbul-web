"use client";
import { fmtDate, formatTL } from "@/lib/format";
import type { MatchDto, MatchSlotsDto } from "./types";
import { useState } from "react";

export default function ActionSidebar({
  match, slots, price, onJoin, balance,
}: {
  match: MatchDto;
  slots: MatchSlotsDto | null;
  price: number;
  onJoin: () => Promise<void>;
  balance: number | null;
}) {
  const { day, time } = fmtDate(match.matchTimestamp);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function click() {
    setBusy(true); setMsg(null);
    try { await onJoin(); setMsg("Katılım başarılı!"); }
    catch (e: any) { setMsg(e?.message ?? "Katılım başarısız"); }
    finally { setBusy(false); }
  }

  return (
    <div className="action-card">
      {!slots?.full ? (
        <span className="status-badge status-available">✓ Müsait</span>
      ) : (
        <span className="status-badge status-full">Dolu</span>
      )}

      <div className="match-summary">
        <div className="summary-row"><span className="summary-label">Tarih</span><span className="summary-value">{day}</span></div>
        <div className="summary-row"><span className="summary-label">Saat</span><span className="summary-value">{time}</span></div>
        <div className="summary-row"><span className="summary-label">Katılımcı</span><span className="summary-value">{(slots?.paidCount ?? 0)}/{slots?.totalSlots ?? match.totalSlots}</span></div>
      </div>

      <div className="price-breakdown">
        <div className="summary-row" style={{ marginBottom: ".5rem" }}>
          <span className="summary-label">Maç Ücreti</span>
          <span className="summary-value">{formatTL(price)}</span>
        </div>
        <div className="summary-row" style={{ fontSize: ".9rem" }}>
          <span style={{ color: "#28a745" }}>Hizmet Bedeli</span>
          <span style={{ color: "#28a745" }}>₺0</span>
        </div>
        <hr className="divider" />
        <div className="summary-row">
          <span className="summary-label" style={{ fontWeight: 600 }}>Toplam</span>
          <span className="summary-value" style={{ fontSize: "1.3rem", color: "var(--brand)", fontWeight: 800 }}>
            {formatTL(price)}
          </span>
        </div>
      </div>

      <button className="join-button" disabled={busy || !!slots?.full} onClick={click}>
        {busy ? "İşleniyor…" : (slots?.full ? "Dolu" : "Maça Katıl")}
      </button>

      {balance !== null && (
        <p className="info-text">
          Bakiyeniz: {formatTL(balance)} {balance >= price ? "— Katılabilirsiniz" : "— Yetersiz bakiye"}
        </p>
      )}
      {msg && <p className="info-text" style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
