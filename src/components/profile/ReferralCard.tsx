"use client";

import { useEffect, useState } from "react";

export default function ReferralCard() {
  const [code, setCode] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [showInfo, setShowInfo] = useState(false); // 🔥 Bilgi popup state
  const [expandCode, setExpandCode] = useState(false); // 📌 Kod kutusu
  const [expandLink, setExpandLink] = useState(false); // 🔗 Link kutusu

  const referralLink = code
    ? `https://macbul.com/register?ref=${code}`
    : "";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/referral-codes/user-actives", { cache: "no-store" });

        if (res.ok) {
          const data = await res.json();
          setCode(data?.code ?? null);
        }
      } catch (err) {
        console.error("Referral load error:", err);
      }
    }
    load();
  }, []);

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setCopiedLink(false);
    setTimeout(() => setCopiedCode(false), 1500);
  }

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setCopiedCode(false);
    setTimeout(() => setCopiedLink(false), 1500);
  }

  if (!code) return null;

  return (
    <div className="ref-card">

      {/* 🔵 Bilgi simgesi */}
      <div
        className="ref-info-icon"
        onClick={() => setShowInfo(!showInfo)}
        title="Davet et, kazan nedir?"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setShowInfo(!showInfo)}
      >
        ℹ
      </div>

      {/* 🔵 Açıklama Popup */}
      {showInfo && (
        <div className="ref-info-popup">
         {/* <strong>🎁 Davet Et, Kazan 🎁</strong>*/}
          <p>
            <strong>Arkadaşlarını <b>MaçBul</b>'a davet et!</strong> Senin referans kodunla kaydolmuş arkadaşlarının oynadığı her maç için
            <b> 20 ₺</b> kazan! 🚀
          </p>
          <button onClick={() => setShowInfo(false)} className="ref-info-close">
            Kapat ✕
          </button>
        </div>
      )}

      <h2 className="ref-title"> DAVET ET 💸 KAZAN </h2>

      <div className="ref-row">

        {/* Kod */}
        <div className="ref-box">
          <div className="ref-header" onClick={() => setExpandCode(!expandCode)}>
            <span className="ref-label">📌 Referans Kodu</span>
            <span className={`ref-toggle ${expandCode ? 'open' : ''}`}>▼</span>
          </div>

          {expandCode && (
            <div className="ref-content">
              <span className="ref-code">{code}</span>

              <button 
                className="ref-btn" 
                onClick={copyCode}
                title="Referans kodunu kopyala"
                aria-label="Referans kodunu kopyala"
              >
                {copiedCode ? "✔️ Kopyalandı" : "📋 Kopyala"}
              </button>
            </div>
          )}
        </div>

        {/* Link */}
        <div className="ref-box">
          <div className="ref-header" onClick={() => setExpandLink(!expandLink)}>
            <span className="ref-label">🔗 Referans Linki</span>
            <span className={`ref-toggle ${expandLink ? 'open' : ''}`}>▼</span>
          </div>

          {expandLink && (
            <div className="ref-content">
              <span className="ref-link">{referralLink}</span>

              <button 
                className="ref-btn" 
                onClick={copyLink}
                title="Referans linkini kopyala"
                aria-label="Referans linkini kopyala"
              >
                {copiedLink ? "✔️ Kopyalandı" : "📋 Kopyala"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
