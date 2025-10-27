"use client";

export default function ProfileTabs({ tabs }: { tabs: string[] }) {
  return (
    <div className="tabs mb-6">
      {tabs.map((t, i) => (
        <button
          key={i}
          className={`tab-btn ${i === 0 ? "active" : ""}`}
          onClick={() => alert(`Sekme: ${t} (içerik yakında)`)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
