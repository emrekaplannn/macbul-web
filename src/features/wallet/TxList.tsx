"use client";
import { formatTL } from "./utils";
import type { TxVM } from "./types";

export default function TxList({ items }: { items: TxVM[] }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗒️</div>
        Henüz işlem yok
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {items.map((t) => (
        <div key={t.id} className="transaction-item">
          <div className={`transaction-icon ${t.icon}`}>
            {t.title === "İade"
              ? "🔄"
              : t.icon === "income"
              ? "💰"
              : "📤"}
          </div>

          <div className="transaction-info">
            <div className="transaction-title">{t.title}</div>
            <div className="transaction-meta">
              <span>
                {t.when.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>
                {t.when.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="transaction-right">
            <div
              className={`transaction-amount ${
                t.sign === "+" ? "positive" : "negative"
              }`}
            >
              {t.sign}
              {formatTL(Math.abs(t.amount))}
            </div>
            <span className="transaction-status status-completed">
              {t.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
