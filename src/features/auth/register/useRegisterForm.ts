"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fullSchema, step1Schema, step2Schema, step3Schema, type FullSchema, type FullSchemaInput } from "./schema";
import type { Step } from "./types";

export function useRegisterForm() {
  const [step, setStep] = useState<Step>(1);
  const [success, setSuccess] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  //            ⬇ TFieldValues         ⬇ TTransformedValues
  const form = useForm<FullSchemaInput, any, FullSchema>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      firstName: "", lastName: "", phone: "", birthDate: "",
      email: "", password: "", confirmPassword: "", referralCode: "",
      position: "", skillLevel: "", city: "",
      terms: false, marketing: false, // input tipinde opsiyonel olsa da default verebilirsin
    },
    mode: "onBlur",
  });

  async function next() {
    const schema = step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema;
    const values = form.getValues();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach(i => form.setError(i.path[0] as any, { message: i.message }));
      return;
    }
    if (step < 3) setStep((s) => ((s + 1) as Step));
  }

  function prev() {
    if (step > 1) setStep((s) => ((s - 1) as Step));
  }

  async function submit(values: FullSchema) {
    // await api.post("/v1/users/register", values);
    setSuccess(true);
  }

  return { form, step, next, prev, submit, success, showReferral, setShowReferral, setSuccess };
}
