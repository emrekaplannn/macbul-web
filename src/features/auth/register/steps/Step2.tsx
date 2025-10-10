"use client";
import { UseFormReturn } from "react-hook-form";
import type { FullSchema, FullSchemaInput } from "../schema";

// RHF: input (FullSchemaInput) -> output (FullSchema)
type RHF = UseFormReturn<FullSchemaInput, any, FullSchema>;

export default function Step2({
  f,
  onNext,
  onPrev,
  showReferral,
  toggleReferral,
  togglePassword,
}: {
  f: RHF;
  onNext: () => void;
  onPrev: () => void;
  showReferral: boolean;
  toggleReferral: () => void;
  togglePassword: (id: string) => void;
}) {
  const {
    register,
    formState: { errors },
  } = f;

  return (
    <div className="space-y-4 animate-slide">
      <Field label="E-posta Adresi" required error={errors.email?.message}>
        <input
          type="email"
          {...register("email")}
          className="input"
          placeholder="ornek@email.com"
          aria-invalid={!!errors.email}
        />
      </Field>

      <Field label="Şifre" required error={errors.password?.message}>
        <div className="relative">
          <input
            id="password"
            type="password"
            {...register("password")}
            className="input w-full"
            placeholder="En az 8 karakter"
            aria-invalid={!!errors.password}
          />
          <span className="eye" onClick={() => togglePassword("password")}>👁️</span>
        </div>
        <small className="text-slate-500 text-xs">
          En az 8 karakter, bir büyük harf ve bir rakam içermeli
        </small>
      </Field>

      <Field label="Şifre Tekrar" required error={errors.confirmPassword?.message}>
        <div className="relative">
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="input w-full"
            placeholder="Şifrenizi tekrar girin"
            aria-invalid={!!errors.confirmPassword}
          />
          <span className="eye" onClick={() => togglePassword("confirmPassword")}>👁️</span>
        </div>
      </Field>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="link-brand w-fit"
          onClick={toggleReferral}
          aria-expanded={showReferral}
        >
          🎁 Referans kodun var mı?
        </button>
        {showReferral && (
          <input
            {...register("referralCode")}
            className="input"
            placeholder="Referans kodunu gir"
          />
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onPrev} className="btn-secondary flex-1">
          ← Geri
        </button>
        <button type="button" onClick={onNext} className="btn-primary flex-1">
          Devam Et →
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
