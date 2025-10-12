export function toNumber(n: string | number | null | undefined): number {
  if (typeof n === "number") return n;
  if (!n) return 0;
  const cleaned = String(n).replace(",", "."); // TR ondalık düzeltmesi
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : 0;
}

export function formatTL(v: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(v);
}
