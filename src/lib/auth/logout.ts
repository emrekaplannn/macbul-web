// Tümü front-end: storage + erişilebilir cookie + caches temizler, sonra redirect opsiyoneldir.

function deleteCookie(name: string, path = "/") {
  try {
    // path ve domain kombinasyonlarıyla silmeyi dene
    const host = window.location.hostname;
    const variants = Array.from(new Set([host, host.replace(/^www\./, "")].filter(Boolean)));
    const opts = [
      `path=${path}`,
      `path=/;SameSite=Lax`,
      `path=/;SameSite=None;Secure`,
    ];

    // domainsiz
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    // domainli
    for (const d of variants) {
      for (const o of opts) {
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${d}; ${o}`;
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${d}; ${o}`;
      }
    }
  } catch {/* noop */}
}

function clearClientStorages() {
  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}
  try {
    const all = document.cookie?.split(";").map(c => c.trim().split("=")[0]) ?? [];
    [...new Set(all.filter(Boolean))].forEach(n => deleteCookie(n));
  } catch {}
  if ("caches" in window) {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
  }
  // İhtiyaç olursa SW:
  // if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
  // }
}

/**
 * Tamamen client-side logout
 * @param redirectTo yönlenecek yol (örn. "/login"); boşsa yönlendirme yapmaz
 * @param extraCookieNames özellikle silmek istediğin cookie adları
 */
export async function clientLogout(
  redirectTo: string = "/login",
  extraCookieNames: string[] = ["access_token", "refresh_token", "id_token", "csrf_token"]
) {
  // Bilinen cookie isimlerini özellikle sil
  extraCookieNames.forEach(n => deleteCookie(n));
  // Tüm client storage’ları temizle
  clearClientStorages();
  // Yönlendir
  if (redirectTo) window.location.replace(redirectTo);
}
