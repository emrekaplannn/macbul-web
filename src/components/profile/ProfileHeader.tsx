"use client";

import { ProfileApiResponse } from "@/lib/profile/types";

function initials(name?: string, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""}`.toUpperCase();
  }
  return (email ?? "U")[0].toUpperCase();
}

export default function ProfileHeader({ data }: { data: ProfileApiResponse }) {
  const displayName = data.me.displayName || data.me.fullName || data.me.email;

  return (
    <div className="profile-header mb-6">
      <div className="profile-header-content">
        {/* Avatar */}
        <div className="profile-avatar">
          {initials(displayName, data.me.email)}
        </div>

        {/* Bilgi alanı */}
        <div className="profile-info">
          <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
          <h2 className="text-base font-medium opacity-90">{data.me.email}</h2>

          <div className="badges">
            <span className="badge">⭐ Güvenilir Oyuncu</span>
            <span className="badge">⚽ {data.me.position ?? "Mevki Belirsiz"}</span>
            <span className="badge">
              {data.me.emailVerified ? "✅ Email Doğrulandı" : "⏳ Email Doğrulanmadı"}
            </span>
          </div>

        </div>

        {/* Düzenleme butonu */}
        <button className="edit-btn" onClick={() => alert("Profil düzenleme yakında!")}>
          Profili Düzenle
        </button>
      </div>
    </div>
  );
}
