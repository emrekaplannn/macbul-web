"use client";
import { UseFormReturn } from "react-hook-form";
import type { FullSchema, FullSchemaInput } from "../schema";

type RHF = UseFormReturn<FullSchemaInput, any, FullSchema>;

export default function Step1({ f, onNext }: { f: RHF; onNext: () => void }) {
  const { register, formState: { errors } } = f;

  return (
    <div className="space-y-4 animate-slide">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Ad" inputId="firstName" required error={errors.firstName?.message}>
          <input
            id="firstName"
            {...register("firstName")}
            className="input"
            placeholder="Adınız"
            aria-invalid={!!errors.firstName}
          />
        </Field>
        <Field label="Soyad" inputId="lastName" required error={errors.lastName?.message}>
          <input
            id="lastName"
            {...register("lastName")}
            className="input"
            placeholder="Soyadınız"
            aria-invalid={!!errors.lastName}
          />
        </Field>
      </div>

      <Field label="Telefon Numarası" inputId="phone" required error={errors.phone?.message}>
        <input
          id="phone"
          {...register("phone")}
          className="input"
          placeholder="05XX XXX XX XX"
          inputMode="tel"
          aria-invalid={!!errors.phone}
        />
      </Field>

      <Field label="Doğum Tarihi" inputId="birthDate" required error={errors.birthDate?.message}>
        <input
          id="birthDate"
          type="date"
          {...register("birthDate")}
          className="input"
          aria-invalid={!!errors.birthDate}
        />
      </Field>

      <div className="flex gap-3">
        <button type="button" onClick={onNext} className="btn-primary flex-1">
          Devam Et →
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  inputId,
  required,
  error,
  children,
}: {
  label: string;
  inputId: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label" htmlFor={inputId}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
