"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginFormValues } from "./types";
import { loginSchema } from "./schema";

export function useLoginForm() {
  const router = useRouter();

  // schema-first: resolver ile aynı tip
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
    mode: "onChange",
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setServerOk(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok !== true) {
        setServerError(data?.message || "Giriş başarısız");
        return;
      }

      setServerOk(true);
      setTimeout(() => router.replace("/matches"), 600);
    } catch (e: any) {
      setServerError(e?.message ?? "Ağ hatası");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    onSubmit,
    submitting,
    serverError,
    serverOk,
    showPw,
    setShowPw,
  };
}
