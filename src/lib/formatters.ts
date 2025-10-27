// lib/formatters.ts
export function formatCurrencyTRY(v: number) {
  try {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
  } catch { return `₺${v}`; }
}

export function formatDateTime(ts: number) {
  try {
    return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(ts));
  } catch { return new Date(ts).toLocaleString(); }
}

export function monthAbbrTR(date: Date) {
  const m = ["OCA","ŞUB","MAR","NİS","MAY","HAZ","TEM","AĞU","EYL","EKİ","KAS","ARA"];
  return m[date.getMonth()];
}
