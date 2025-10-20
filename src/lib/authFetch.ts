// Basit bir fetch sarmalayıcı: 401 → /api/auth/refresh → tekrar dene (1 kez)
export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, { ...init, credentials: "include", cache: "no-store" });
  if (res.status !== 401) return res;

  // 401 ise refresh dene
  const r = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // çoğu durumda body gerekmez, cookie’den okuyoruz
    body: JSON.stringify({}),
    credentials: "include",
    cache: "no-store",
  });

  if (!r.ok) {
    // refresh de başarısızsa orijinal 401’i döndürelim
    return res;
  }

  // refresh başarılı → isteği 1 kez tekrar dene
  return fetch(input, { ...init, credentials: "include", cache: "no-store" });
}
