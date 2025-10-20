"use client";

import { useEffect, useMemo, useState } from "react";
import { getMe, resendEmailOtp, verifyEmailOtp } from "@/lib/api/otp";
import OtpCode from "@/components/auth/OtpCode";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailView() {
  const router = useRouter();
  const search = useSearchParams();
  const emailFromQuery = search.get("email") || ""; // opsiyonel: register sonrası ?email=... ile gelebilir
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown === 0;

  // email yoksa profilden çek
  useEffect(() => {
    if (email) return;
    getMe().then((m) => m?.email && setEmail(m.email!)).catch(() => {});
  }, [email]);

  // ilk girişte geri sayım
  useEffect(() => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // 6 hane dolunca otomatik doğrula
  useEffect(() => {
    if (code.replace(/\D/g, "").length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!domain) return email;
    const m = user.length <= 2 ? user[0] + "*" : user[0] + "*".repeat(user.length - 2) + user[user.length - 1];
    return `${m}@${domain}`;
  }, [email]);

  const handleVerify = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await verifyEmailOtp(code);
      if (res.success) {
        setOk(true);
        setTimeout(() => router.replace("/matches"), 1200);
      } else {
        throw new Error("Hatalı kod");
      }
    } catch (e: any) {
      setError(e?.message ?? "Doğrulama başarısız");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!email) return setError("E-posta bulunamadı");
    setBusy(true);
    setError(null);
    try {
      await resendEmailOtp(email, false);
      // geri sayımı sıfırla
      setCountdown(60);
      const t = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (e: any) {
      setError(e?.message ?? "Kod gönderilemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="verify-wrap">
      <div className="verify-card">
        <div className="verify-header">
          <div className="verify-email-icon">📧</div>
          <h1>Email Adresini Doğrula</h1>
          <p>Hesabını güvence altına al</p>
        </div>

        {!ok ? (
          <div className="verify-body">
            <div className="verify-sent">
              <div className="verify-sent-label">Doğrulama kodu gönderildi</div>
              <div className="verify-sent-email">{maskedEmail || "—"}</div>
            </div>

            <p className="verify-instruction">
              Email adresine gelen <b>6 haneli</b> kodu gir.
            </p>

            {!!error && (
              <div className="verify-alert verify-alert-error">❌ {error}</div>
            )}

            <OtpCode value={code} onChange={setCode} disabled={busy} hasError={!!error} />

            <button className="verify-btn" disabled={busy || code.length !== 6} onClick={handleVerify}>
              {busy ? "Doğrulanıyor..." : "Doğrula"}
            </button>

            <div className="verify-resend">
              <div className="verify-resend-text">Kod gelmedi mi?</div>
              {canResend ? (
                <button className="verify-resend-btn" onClick={handleResend} disabled={busy || !email}>
                  📧 Kodu Tekrar Gönder
                </button>
              ) : (
                <div className="verify-resend-timer">Yeniden gönder ({countdown}s)</div>
              )}
            </div>

            <div className="verify-help">
              <div className="verify-help-title">💡 Yardım</div>
              <div className="verify-help-text">
                • Spam/Gereksiz klasörünü kontrol et<br />
                • Kod 10 dakika geçerlidir<br />
                • Sorun yaşıyorsan destekle iletişime geç
              </div>
            </div>
          </div>
        ) : (
          <div className="verify-success">
            <div className="verify-success-icon">🎉</div>
            <h2>Email Doğrulandı!</h2>
            <p>Harika! Şimdi maç listesine yönlendiriliyorsun…</p>
            <button className="verify-continue-btn" onClick={() => router.replace("/matches")}>
              Devam Et →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
