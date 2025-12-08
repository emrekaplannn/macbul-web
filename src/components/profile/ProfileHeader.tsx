"use client";

import { ProfileApiResponse } from "@/lib/profile/types";
import { useAvatarUrl } from "@/features/profile/useAvatarUrl";
import fallbackAvatar from "@/app/avatar/fallback.png";

function initials(name?: string, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    return `${parts[0]?.[0] ?? ""}${
      parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
    }`.toUpperCase();
  }
  return (email ?? "U")[0].toUpperCase();
}

export default function ProfileHeader({ data }: { data: ProfileApiResponse }) {
  const avatarUrl = useAvatarUrl();
  const hasRealAvatar = avatarUrl && avatarUrl !== fallbackAvatar.src;

  const displayName =
    data.me.displayName || data.me.fullName || data.me.email;

  const initialsText = initials(displayName, data.me.email);

  return (
    <div className="profile-header mb-6">
      <div className="profile-header-content">

        {/* Avatar */}
        <div className="profile-avatar" style={{ position: "relative" }}>
          {hasRealAvatar ? (
            <img
              src={avatarUrl}
              alt="Profil"
              className="profile-avatar-img"
              loading="lazy"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = fallbackAvatar.src;
              }}
            />
          ) : (
            <span className="profile-avatar-initials">{initialsText}</span>
          )}
        </div>

        {/* Bilgiler */}
        <div className="profile-info">
          <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
          <h2 className="text-base font-medium opacity-90">
            {data.me.email}
          </h2>

          <div className="badges">
            <span className="badge">
              ⚽ {data.me.position ?? "Mevki Seçilmedi⚠️"}
            </span>
            <span className="badge">
              📍 {data.me.location ?? "Konum Seçilmedi⚠️"}
            </span>
            <span className="badge">
              {data.me.emailVerified
                ? "✅ Email Doğrulandı"
                : "⏳ Email Doğrulanmadı"}
            </span>
          </div>
        </div>

        <button
          className="edit-btn"
          onClick={() => alert("Profil düzenleme yakında!")}
        >
          Profili Düzenle
        </button>
      </div>
    </div>
  );
}
