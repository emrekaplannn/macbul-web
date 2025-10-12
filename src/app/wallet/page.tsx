"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BalanceCard from "@/features/wallet/BalanceCard";
import TxFilters, { type TxFilter } from "@/features/wallet/TxFilters";
import TxList from "@/features/wallet/TxList";
import { toNumber } from "@/features/wallet/utils";
import type { WalletDto, TransactionDto, WalletVM, TxVM } from "@/features/wallet/types";

const DEBUG = true;

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletVM | null>(null);
  const [txs, setTxs] = useState<TxVM[]>([]);
  const [filter, setFilter] = useState<TxFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const [wRes, tRes] = await Promise.all([
          fetch("/api/wallet", { cache: "no-store" }),
          fetch("/api/transactions", { cache: "no-store" }),
        ]);

        const wJson = await wRes.json().catch(() => ({}));
        const tJson = await tRes.json().catch(() => ({}));

        if (!wRes.ok) throw new Error(wJson?.message || "Cüzdan alınamadı");
        if (!tRes.ok) throw new Error(tJson?.message || "İşlem listesi alınamadı");

        const wDto = wJson.wallet as WalletDto | null;
        const walletVm: WalletVM | null = wDto
          ? { balance: toNumber(wDto.balance), updatedAt: wDto.updatedAt }
          : null;

        const txDtos: TransactionDto[] = Array.isArray(tJson.items) ? tJson.items : [];
        const txVm: TxVM[] = txDtos.map((d) => {
          const amount = toNumber(d.amount);
          const icon = d.type === "LOAD" || d.type === "REFUND" ? "income" : "expense";
          const sign = icon === "income" ? "+" : "-";
          const title =
            d.type === "LOAD" ? "Bakiye Yükleme" :
            d.type === "PAY" ? "Maç Ödemesi" :
            "İade";

          return {
            id: d.id,
            icon,
            title,
            amount,
            sign,
            status: "Tamamlandı",
            when: new Date(d.createdAt),
          };
        });

        if (alive) { setWallet(walletVm); setTxs(txVm); }
        DEBUG && console.log("[wallet] ok", { walletVm, txCount: txVm.length });
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Hata");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 🔎 Filtreler sadece LOAD | PAY | REFUND (ve ALL)
  const filtered = useMemo(() => {
    if (filter === "ALL") return txs;
    if (filter === "LOAD")   return txs.filter((t) => t.title === "Bakiye Yükleme");
    if (filter === "PAY")    return txs.filter((t) => t.title === "Maç Ödemesi");
    if (filter === "REFUND") return txs.filter((t) => t.title === "İade");
    return txs;
  }, [txs, filter]);

  function openModal(kind: "deposit" | "withdraw") {
    alert(kind === "deposit" ? "Bakiye yükleme akışı yakında" : "Para çekme akışı yakında");
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <header className="topbar">
        <div className="topbar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/matches" className="logo-link">←</Link>
            <Link href="/" className="logo-link">MaçBul</Link>
          </div>
          <div className="user-info">
            <div className="balance">Cüzdan</div>
            <div className="avatar">AY</div>
          </div>
        </div>
      </header>

      <div className="container-xl">
        <div className="page-header">
          <h1>Cüzdanım</h1>
          <p>Bakiyeni yönet, işlem geçmişini görüntüle</p>
        </div>

        {err && <div className="empty" style={{ color: "#b02a37" }}>
          <strong>Hata:</strong> {err}
        </div>}

        <BalanceCard
          amount={wallet?.balance ?? 0}
          onDeposit={() => openModal("deposit")}
          onWithdraw={() => openModal("withdraw")}
        />

        <div className="content-grid">
          <div className="card--wallet">
            <div className="card-header--white" 
            >
              <h2 className="card-title">📊 İşlem Geçmişi</h2>
            </div>

            <TxFilters value={filter} onChange={setFilter} />

            {loading ? (
              <div className="empty">
                <div className="spinner"></div>
                <p style={{ marginTop: 12, color: "#6c757d" }}>Yükleniyor…</p>
              </div>
            ) : (
              <TxList items={filtered} />
            )}
          </div>

          {/* Sağ panel */}
          <div className="sidebar">
            <div className="card--wallet">
              <h3 className="card-title--fast">⚡ Hızlı İşlemler</h3>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => openModal("deposit")}>
                  <div className="action-icon">💰</div><span>Bakiye Yükle</span>
                </button>
                <button className="action-btn" onClick={() => openModal("withdraw")}>
                  <div className="action-icon">📤</div><span>Para Çek</span>
                </button>
                <button className="action-btn" onClick={() => alert("İşlem geçmişi raporu indiriliyor...")}>
                  <div className="action-icon">📥</div><span>Rapor İndir</span>
                </button>
              </div>
            </div>

            <div className="card--wallet">
              <h3 className="card-title--fast">💳 Ödeme Yöntemleri</h3>
              <div className="payment-methods">
                <div className="payment-method"><div className="payment-icon">💳</div><div className="payment-info"><h4>Kredi/Banka Kartı</h4><p>Anında yükleme</p></div></div>
                <div className="payment-method"><div className="payment-icon">🏦</div><div className="payment-info"><h4>Banka Transferi</h4><p>1-2 iş günü</p></div></div>
                <div className="payment-method"><div className="payment-icon">📱</div><div className="payment-info"><h4>Mobil Ödeme</h4><p>Anında yükleme</p></div></div>
              </div>
            </div>

            <div className="card" style={{ background: "#f8f9fa" }}>
              <h4 style={{ marginBottom: "1rem", color: "#2c3e50" }}>💡 Bilgi</h4>
              <p style={{ fontSize: ".9rem", color: "#6c757d", lineHeight: 1.6 }}>
                Minimum yükleme tutarı ₺10’dur. Para çekme işlemleri 1-3 iş günü içinde hesabınıza aktarılır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
