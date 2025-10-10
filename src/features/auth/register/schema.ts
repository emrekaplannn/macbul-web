import { z } from "zod";

// Adım 1
export const step1Schema = z.object({
  firstName: z.string().min(1, { message: "Ad zorunludur" }),
  lastName: z.string().min(1, { message: "Soyad zorunludur" }),
  phone: z.string().min(7, { message: "Telefon numarası en az 7 karakter olmalıdır" }),
  birthDate: z.string().min(4, { message: "Doğum tarihi geçerli olmalıdır" }),
});

// Adım 2
export const step2Schema = z
  .object({
    email: z.string().email({ message: "Geçerli bir e-posta adresi girin" }),
    password: z.string().min(8, { message: "Şifre en az 8 karakter olmalıdır" }),
    confirmPassword: z.string().min(8, { message: "Şifre tekrarı en az 8 karakter olmalıdır" }),
    referralCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Şifreler eşleşmiyor",
  });

// Adım 3
export const step3Schema = z.object({
  position: z.string().min(1, { message: "Pozisyon seçilmelidir" }),
  skillLevel: z.string().min(1, { message: "Oyun seviyesi seçilmelidir" }),
  city: z.string().min(1, { message: "Şehir seçilmelidir" }),
  terms: z.boolean().refine((v) => v === true, {
    message: "Kullanım koşullarını kabul etmelisiniz",
  }),
  marketing: z.boolean().default(false),
});

// Tüm adımların birleşimi
export const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
export type FullSchema = z.infer<typeof fullSchema>;
export type FullSchemaInput = z.input<typeof fullSchema>;
