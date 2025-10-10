"use client";
import { UseFormReturn } from "react-hook-form";
import type { FullSchema, FullSchemaInput } from "../schema";

// RHF tipi (input ve output ayrı)
type RHF = UseFormReturn<FullSchemaInput, any, FullSchema>;

export default function Step3({
  f,
  onPrev,
  onSubmit,
}: {
  f: RHF;
  onPrev: () => void;
  onSubmit: (v: FullSchema) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = f;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 animate-slide"
      noValidate
    >
      <Field label="Tercih Ettiğin Pozisyon" required error={errors.position?.message}>
        <select {...register("position")} className="select" aria-invalid={!!errors.position}>
          <option value="">Pozisyon Seç</option>
          <option value="goalkeeper">Kaleci</option>
          <option value="defender">Defans</option>
          <option value="midfielder">Orta Saha</option>
          <option value="forward">Forvet</option>
          <option value="any">Fark Etmez</option>
        </select>
      </Field>

      <Field label="Oyun Seviyesi" required error={errors.skillLevel?.message}>
        <select {...register("skillLevel")} className="select" aria-invalid={!!errors.skillLevel}>
          <option value="">Seviye Seç</option>
          <option value="beginner">Başlangıç</option>
          <option value="intermediate">Orta</option>
          <option value="advanced">İleri</option>
          <option value="professional">Profesyonel</option>
        </select>
      </Field>

      <Field label="Şehir" required error={errors.city?.message}>
        <select {...register("city")} className="select" aria-invalid={!!errors.city}>
          <option value="">Şehir Seç</option>
          <option value="istanbul">İstanbul</option>
          <option value="ankara">Ankara</option>
          <option value="izmir">İzmir</option>
          <option value="bursa">Bursa</option>
          <option value="antalya">Antalya</option>
        </select>
      </Field>

      {/* Koşullar */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border">
        <input
          type="checkbox"
          {...register("terms")}
          id="terms"
          className="mt-1 size-5 accent-brand"
          aria-invalid={!!errors.terms}
        />
        <label htmlFor="terms" className="text-sm text-slate-600">
          <a href="#" className="link-brand font-semibold">Kullanım Koşulları</a>’nı ve{" "}
          <a href="#" className="link-brand font-semibold">Gizlilik Politikası</a>’nı okudum, kabul ediyorum.
        </label>
      </div>
      {errors.terms && (
        <span className="text-red-500 text-xs">{errors.terms.message}</span>
      )}

      {/* Pazarlama izni */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border">
        <input
          type="checkbox"
          {...register("marketing")}
          id="marketing"
          className="mt-1 size-5 accent-brand"
        />
        <label htmlFor="marketing" className="text-sm text-slate-600">
          Kampanya ve yeniliklerden haberdar olmak istiyorum.
        </label>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onPrev} className="btn-secondary flex-1">
          ← Geri
        </button>
        <button type="submit" className="btn-primary flex-1">
          Hesabı Oluştur
        </button>
      </div>
    </form>
  );
}

// Ortak Field bileşeni
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
