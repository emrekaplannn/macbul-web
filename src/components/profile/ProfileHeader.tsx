"use client";

import { ProfileApiResponse } from "@/lib/profile/types";

function initials(name?: string, email?: string) {
  if (name?.trim()) {
    const p = name.trim().split(" ");
    return `${p[0]?.[0] ?? ""}${p.length > 1 ? p[p.length - 1]?.[0] ?? "" : ""}`.toUpperCase();
  }
  return (email ?? "U")[0].toUpperCase();
}

export default function ProfileHeader({ data }: { data: ProfileApiResponse }) {
  const displayName =
    data.me.displayName ||
    [data.me.firstName, data.me.lastName].filter(Boolean).join(" ") ||
    data.me.email;

  return (
    <div className="profile-header mb-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="profile-avatar">
          {initials(displayName, data.me.email)}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{displayName}</h1>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">⭐ Güvenilir Oyuncu</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">⚽ {data.me.position ?? "Mevki Belirsiz"}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {data.me.emailVerified ? "✅ Email Doğrulandı" : "⏳ Email Doğrulanmadı"}
            </span>
          </div>

          <div className="flex flex-wrap gap-8">
            <div>
              <div className="text-3xl font-bold">{data.stats.totalMatches}</div>
              <div className="text-sm opacity-90">Toplam Maç</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{data.stats.goals}</div>
              <div className="text-sm opacity-90">Gol</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{data.stats.assists}</div>
              <div className="text-sm opacity-90">Asist</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{data.stats.avgRating ?? "-"}</div>
              <div className="text-sm opacity-90">Ortalama Puan (10 üstü)</div>
            </div>
          </div>
        </div>

        <button
          className="bg-white text-[#17a2b8] px-5 py-2 rounded-lg font-semibold hover:shadow-md transition"
          onClick={() => alert("Profil düzenleme yakında!")}
        >
          Profili Düzenle
        </button>
      </div>
    </div>
  );
}
