"use client";

import { UseFormRegister, FieldError } from "react-hook-form";
import type { LoginFormValues } from "./types";

export default function EmailPassword({
  register,
  errors,
  showPw,
  togglePw,
}: {
  register: UseFormRegister<LoginFormValues>;
  errors: { email?: FieldError; password?: FieldError };
  showPw: boolean;
  togglePw: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="label">E-posta</label>
        <input
          id="email"
          type="email"
          placeholder="ornek@email.com"
          className="input w-full"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <small className="text-slate-500 text-xs" role="alert">{errors.email.message}</small>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="label">Şifre</label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            placeholder="Şifreniz"
            className="input w-full pr-10"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <span className="eye" onClick={togglePw} aria-label="Şifreyi göster/gizle">
            {showPw ? "🙈" : "👁️"}
          </span>
        </div>
        {errors.password && (
          <small className="text-slate-500 text-xs" role="alert">{errors.password.message}</small>
        )}
      </div>
    </>
  );
}
