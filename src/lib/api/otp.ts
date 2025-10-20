// src/lib/api/otp.ts
export type OtpType = "EMAIL_VERIFY" | "PHONE_VERIFY";

// NOT: Bu fonksiyonlar artık Next.js /api route'larına vuruyor.
// authFetch şart değil; fetch yeterli (cookie otomatik gider). İstersen authFetch ile de çağırabilirsin.

export async function resendEmailOtp(destinationEmail: string, returnCode = false) {
  const res = await fetch(`/api/otp?returnCode=${returnCode ? "true" : "false"}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "EMAIL_VERIFY", destination: destinationEmail }),
  });
  if (!res.ok) throw new Error("OTP gönderilemedi");
  return res.json() as Promise<{ otp: any; code?: string }>;
}

export async function verifyEmailOtp(code: string) {
  const res = await fetch(`/api/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "EMAIL_VERIFY", code }),
  });
  if (!res.ok) throw new Error("OTP doğrulanamadı");
  return res.json() as Promise<{ success: boolean }>;
}

export async function getMe(): Promise<{ email?: string }> {
  const res = await fetch(`/api/profile/me`, { method: "GET", cache: "no-store" });
  if (!res.ok) return {};
  return res.json();
}
