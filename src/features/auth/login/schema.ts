import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre zorunludur"),
  // opsiyonel yerine zorunlu boolean; varsayılanı form'da veriyoruz
  remember: z.boolean(),
});

export type LoginSchema = z.infer<typeof loginSchema>;   // form değer tipi
export type LoginSchemaInput = z.input<typeof loginSchema>; // gerekirse input tip (şu an aynı)
