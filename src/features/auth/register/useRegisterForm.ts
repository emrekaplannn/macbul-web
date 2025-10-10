"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fullSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  type FullSchema,
  type FullSchemaInput,
} from "./schema";
import type { Step } from "./types";

export function useRegisterForm() {
  const [step, setStep] = useState<Step>(1);
  const [success, setSuccess] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  //            ⬇ TFieldValues (input)      ⬇ TTransformedValues (output)
  const form = useForm<FullSchemaInput, any, FullSchema>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      birthDate: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      position: "",
      skillLevel: "",
      city: "",
      terms: false,
      marketing: false,
    },
    mode: "onBlur",
  });

  async function next() {
    const schema = step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema;
    const values = form.getValues();
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((i) =>
        form.setError(i.path[0] as any, { message: i.message })
      );
      return;
    }
    if (step < 3) setStep((s) => ((s + 1) as Step));
  }

  function prev() {
    if (step > 1) setStep((s) => ((s - 1) as Step));
  }

  // Backend'e gönderim
  async function submit(values: FullSchema) {
    // eski sunucu hatasını temizle
    form.clearErrors("root");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      // json dönmeyebilir; o yüzden try-catch ile al
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          (res.status === 400 || res.status === 422
            ? "Form bilgilerinde hata var."
            : "Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.");

        // genel form hatası olarak göster
        form.setError("root", { type: "server", message: msg });
        return;
      }

      // cookie'ler route handler tarafından set edildi — burada sadece başarı ekranına geç
      setSuccess(true);
    } catch (err: any) {
      form.setError("root", {
        type: "server",
        message: "Bağlantı hatası. Lütfen internetinizi kontrol edin.",
      });
    }
  }

  return {
    form,
    step,
    next,
    prev,
    submit,
    success,
    showReferral,
    setShowReferral,
    setSuccess,
  };
}
