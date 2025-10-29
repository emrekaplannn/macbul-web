"use client";

import { useEffect, useState } from "react";
import { toNumber } from "@/features/wallet/utils";
import { authFetch } from "@/lib/authFetch";
import type { WalletDto, TransactionDto, WalletVM, TxVM } from "@/features/wallet/types";

const DEBUG = true;

export default function WalletCard() {
  const [wallet, setWallet] = useState<WalletVM | null>(null);
  const [txs, setTxs] = useState<TxVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [wRes, tRes] = await Promise.all([
          authFetch("/api/wallet", { cache: "no-store" }),
          authFetch("/api/transactions", { cache: "no-store" }),
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
        const txVm: TxVM[] = txDtos.slice(0, 3).map((d) => {
          const amount = toNumber(d.amount);
          const icon = d.type === "LOAD" || d.type === "REFUND" ? "income" : "expense";
          const sign = icon === "income" ? "+" : "-";
          const title =
            d.type === "LOAD"
              ? "Bakiye Yükleme"
              : d.type === "PAY"
              ? "Maç Ödemesi"
              : "İade";

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

        if (alive) {
          setWallet(walletVm);
          setTxs(txVm);
        }

        DEBUG && console.log("[PROFILE-WALLET] ok", { walletVm, txCount: txVm.length });
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Hata");
        console.error("[PROFILE-WALLET] error", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="profil-wallet-card">
        <div className="profil-wallet-empty">
          <div className="profil-wallet-spinner"></div>
          <p>Yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="profil-wallet-card">
        <div className="profil-wallet-empty error">
          <strong>Hata:</strong> {err}
        </div>
      </div>
    );
  }

  return (
    <div className="profil-wallet-card">
      <div className="profil-wallet-header">
        <div className="profil-wallet-title">💳 Cüzdan</div>
        <a href="/wallet" className="profil-wallet-link">Tümünü Gör →</a>
      </div>

      {/* Bakiye Alanı */}
      <div className="profil-wallet-balance">
        <div className="profil-wallet-balance-label">Mevcut Bakiye</div>
        <div className="profil-wallet-balance-value">
          ₺{wallet?.balance?.toLocaleString("tr-TR") ?? 0}
        </div>
        <div className="profil-wallet-actions">
          <button className="profil-wallet-btn" onClick={() => alert("Bakiye yükleme yakında")}>
            💰 Bakiye Yükle
          </button>
          <button className="profil-wallet-btn" onClick={() => alert("Para çekme yakında")}>
            📤 Para Çek
          </button>
        </div>
      </div>

      {/* Son İşlemler */}
      <div className="profil-wallet-tx-list">
        {txs.length === 0 ? (
          <div className="profil-wallet-empty">Henüz işlem bulunamadı.</div>
        ) : (
          txs.map((t) => (
            <div key={t.id} className="profil-wallet-tx-item">
              <div
                className={`profil-wallet-tx-icon ${
                  t.icon === "income" ? "income" : "expense"
                }`}
              >
                {t.title === "İade"
                  ? "🔄"
                  : t.icon === "income"
                  ? "💰"
                  : "📤"}
              </div>
              <div className="profil-wallet-tx-info">
                <div className="profil-wallet-tx-title">{t.title}</div>
                <div className="profil-wallet-tx-date">
                  {t.when.toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  •{" "}
                  {t.when.toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div
                className={`profil-wallet-tx-amount ${
                  t.icon === "income" ? "income" : "expense"
                }`}
              >
                {t.sign}₺{t.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
