"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok !== true) {
        setErr(data?.message || "Giriş başarısız");
        return;
      }
      setOk(true);
      setTimeout(() => router.replace("/matches"), 600);
    } catch (e: any) {
      setErr(e?.message ?? "Ağ hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand-logo">MaçBul</div>
          <p className="brand-tagline">Halı saha maçını bul, hemen katıl</p>
          <div className="brand-features">
            <Feature icon="📍" title="Yakınındaki Maçlar" text="En yakın açık maçları keşfet" />
            <Feature icon="⚡" title="Anında Katılım" text="Tek tıkla maça kaydol" />
            <Feature icon="⚖️" title="Dengeli Takımlar" text="Otomatik takım eşleştirme" />
          </div>
        </div>

        <div className="login-right animate-fade">
          <div className="login-header">
            <h2>Hoş Geldin! 👋</h2>
            <p>Hesabına giriş yap ve maçları keşfet</p>
          </div>

          {err && <div className="alert" style={{ background: "#f8d7da", color: "#721c24" }}>❌ {err}</div>}
          {ok && <div className="alert" style={{ background: "#d4edda", color: "#155724" }}>✅ Giriş başarılı! Yönlendiriliyorsunuz…</div>}

          <form onSubmit={onSubmit} className="flex flex-col gap-6 animate-slide">
            <div className="flex flex-col gap-2">
              <label className="label">E-posta</label>
              <input
                type="email"
                required
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
                <label className="label">Şifre</label>
                <div className="relative">
                    <input
                    type={showPw ? "text" : "password"}
                    required
                    placeholder="Şifreniz"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10 w-full"
                    />
                    <span className="eye" onClick={() => setShowPw(!showPw)}>
                    {showPw ? "🙈" : "👁️"}
                    </span>
                </div>
            </div>


            <div className="form-options">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                Beni Hatırla
              </label>
              <a href="/forgot" className="link-brand text-sm">Şifremi Unuttum</a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Yükleniyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="signup-link">
            Hesabın yok mu? <a href="/register">Hemen Kayıt Ol</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="feature-item">
      <div className="feature-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}
