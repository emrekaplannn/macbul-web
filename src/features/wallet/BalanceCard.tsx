"use client";
import { formatTL } from "./utils";

export default function BalanceCard({ amount, onDeposit, onWithdraw }: {
  amount: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  return (
    <div className="balance-card">
      <div className="balance-header">
        <div className="balance-info">
          <h3>Toplam Bakiye</h3>
          <div className="balance-amount">{formatTL(amount)}</div>
        </div>
        <div className="balance-actions">
          <button className="balance-btn" onClick={onDeposit}><span>💰</span><span>Bakiye Yükle</span></button>
          <button className="balance-btn" onClick={onWithdraw}><span>📤</span><span>Para Çek</span></button>
        </div>
      </div>
    </div>
  );
}
