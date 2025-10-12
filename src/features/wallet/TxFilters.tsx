"use client";
import { useMemo } from "react";

export type TxFilter = "ALL" | "LOAD" | "PAY" | "REFUND";

export default function TxFilters({
  value, onChange,
}: { value: TxFilter; onChange: (v: TxFilter) => void }) {

  const items = useMemo(
    () =>
      [
        ["ALL", "Tümü"],
        ["LOAD", "Yüklemeler"],
        ["PAY", "Harcamalar"],
        ["REFUND", "İadeler"],
      ] as const,
    []
  );

  return (
    <div className="transaction-filters">
      {items.map(([k, label]) => (
        <button
          key={k}
          className={`filter-btn ${value === k ? "active" : ""}`}
          onClick={() => onChange(k as TxFilter)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
