"use client";

import Link from "next/link";
import LeftPanel from "./LeftPanel";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Success from "./steps/Success";
import { useRegisterForm } from "./useRegisterForm";

export default function RegisterLayout() {
  const {
    form,
    step,
    next,
    prev,
    submit,
    success,
    showReferral,
    setShowReferral,
  } = useRegisterForm();

  const togglePassword = (id: string) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    const isPwd = el.type === "password";
    el.type = isPwd ? "text" : "password";
    const icon = el.nextElementSibling as HTMLElement | null;
    if (icon) icon.textContent = isPwd ? "🙈" : "👁️";
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center brand-gradient p-6"
      aria-label="Kayıt ekranı"
    >
      <div className="grid md:grid-cols-[1fr_1.2fr] w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        <LeftPanel step={step} />

        <div className="p-6 md:p-10 max-h-[90vh] overflow-y-auto">
          {!success ? (
            <>
              <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Hesap Oluştur
                </h1>
                <p className="text-slate-500">
                  Hemen kayıt ol, maçlara katılmaya başla
                </p>
              </header>

              {step === 1 && <Step1 f={form} onNext={next} />}

              {step === 2 && (
                <Step2
                  f={form}
                  onNext={next}
                  onPrev={prev}
                  showReferral={showReferral}
                  toggleReferral={() => setShowReferral((s) => !s)}
                  togglePassword={togglePassword}
                />
              )}

              {step === 3 && <Step3 f={form} onPrev={prev} onSubmit={submit} />}

              <p className="text-center mt-6 text-slate-600">
                Zaten hesabın var mı?{" "}
                <Link href="/login" className="link-brand">
                  Giriş Yap
                </Link>
              </p>
            </>
          ) : (
            <Success />
          )}
        </div>
      </div>
    </main>
  );
}
