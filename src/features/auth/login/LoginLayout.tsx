"use client";

import EmailPassword from "./EmailPassword";
import { useLoginForm } from "./useLoginForm";

export default function LoginLayout() {
  const {
    form: { register, handleSubmit, formState: { errors, isValid }, watch, setValue },
    onSubmit,
    submitting,
    serverError,
    serverOk,
    showPw,
    setShowPw,
  } = useLoginForm();

  const remember = watch("remember");

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left brand */}
        <div className="login-left">
          <div className="brand-logo">MaçBul</div>
          <p className="brand-tagline">Halı saha maçını bul, hemen katıl</p>

          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">📍</div>
              <div>
                <h3>Yakınındaki Maçlar</h3>
                <p>En yakın açık maçları keşfet</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div>
                <h3>Anında Katılım</h3>
                <p>Tek tıkla maça kaydol</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚖️</div>
              <div>
                <h3>Dengeli Takımlar</h3>
                <p>Otomatik takım eşleştirme</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="login-right animate-fade">
          <div className="login-header">
            <h2>Hoş Geldin! 👋</h2>
            <p>Hesabına giriş yap ve maçları keşfet</p>
          </div>

          {serverError && (
            <div className="alert" style={{ background: "#f8d7da", color: "#721c24" }}>
              ❌ {serverError}
            </div>
          )}
          {serverOk && (
            <div className="alert" style={{ background: "#d4edda", color: "#155724" }}>
              ✅ Giriş başarılı! Yönlendiriliyorsunuz…
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 animate-slide">
            <EmailPassword
              register={register}
              errors={{ email: errors.email, password: errors.password }}
              showPw={showPw}
              togglePw={() => setShowPw((s) => !s)}
            />

            <div className="form-options">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={!!remember}
                  onChange={(e) => setValue("remember", e.target.checked)}
                />
                Beni Hatırla
              </label>
              <a href="/forgot" className="link-brand text-sm">Şifremi Unuttum</a>
            </div>

            <button
              type="submit"
              disabled={submitting || !isValid}
              className="btn-primary w-full"
            >
              {submitting ? "Yükleniyor..." : "Giriş Yap"}
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
