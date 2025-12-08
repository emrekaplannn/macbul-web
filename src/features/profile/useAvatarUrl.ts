// src/features/profile/useAvatarUrl.ts
"use client";

import { useEffect, useState } from "react";
import fallbackAvatar from "@/app/avatar/fallback.png";

// Maç sayfasındakiyle aynı mantık
function pickSafeAvatar(raw: unknown): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return fallbackAvatar.src;
  try {
    const u = new URL(s);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {}
  return fallbackAvatar.src;
}

export function useAvatarUrl() {
  const [avatarUrl, setAvatarUrl] = useState<string>(fallbackAvatar.src);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/profile/avatar", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!alive) return;
        const chosen = pickSafeAvatar((data as any)?.url);
        setAvatarUrl(chosen);
        if (process.env.NODE_ENV === "development") {
          console.debug("[avatar] response", { status: res.status, data, chosen });
        }
      } catch (e) {
        if (!alive) return;
        setAvatarUrl(fallbackAvatar.src);
        if (process.env.NODE_ENV === "development") {
          console.debug("[avatar] fetch error → fallback", e);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return avatarUrl;
}
