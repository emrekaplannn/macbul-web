"use client";
import { submitPlayerFeedback } from "@/lib/api/feedback";
import Image from "next/image";
import React from "react";

type Props = {
  matchId: string;
  player: {
    id: string;
    initials: string;
    name: string;
    team: "A" | "B";
    stats?: string;
    overall?: number;
    avatarUrl?: string | null;
  };
};

const PRESET_TAGS = [
  "Hücumda iyi",
  "Savunmada iyi",
  "Koşu mesafesi iyi",
  "İletişimi iyi",
  "Takım oyunu iyi",
  "Kaleci performansı iyi",
  "Spor ahlakı iyi",
] as const;

const MAX_LEN = 255;

export default function PlayerFeedbackCard({ matchId, player }: Props) {
  const [stars, setStars] = React.useState<number>(0);
  const [freeText, setFreeText] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [sending, setSending] = React.useState(false);

  const canSend =
    stars > 0 || freeText.trim().length > 0 || selectedTags.length > 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const buildFinalComment = () => {
    const tagsPart = selectedTags.join(", ");
    const sep = freeText.trim() && tagsPart ? " — " : "";
    const composed = `${freeText.trim()}${sep}${tagsPart}`.trim();
    return composed.slice(0, MAX_LEN);
  };

  const onSend = async () => {
    if (!canSend) return;

    const payload = {
      matchId,
      targetId: player.id,
      overallRating: stars,
      comment: buildFinalComment() || undefined,
    };

    setSending(true);
    try {
      console.log("[PlayerFeedbackCard] Sending player feedback payload:", payload);

      const resp = await submitPlayerFeedback(payload);

      console.log("[PlayerFeedbackCard] Player feedback success response:", resp);

      // İstersen burada formu sıfırlayabilirsin:
      // setStars(0);
      // setFreeText("");
      // setSelectedTags([]);

    } catch (err) {
      console.error("[PlayerFeedbackCard] Error while sending player feedback:", err);
      // Buraya toast / UI hata mesajı entegre edebilirsin
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="match-feedback-player">
      <div className="match-feedback-p-ava">
        {player.avatarUrl ? (
          <Image
            src={player.avatarUrl}
            alt={player.name}
            width={50}
            height={50}
          />
        ) : (
          <span>{player.initials}</span>
        )}
      </div>

      <div>
        <div className="match-feedback-p-name">
          {player.name}{" "}
          {player.overall ? (
            <span className="match-feedback-overall">{player.overall}</span>
          ) : null}
        </div>
        <div className="match-feedback-p-meta">
          {(player.stats || "")} {player.team && <>• Takım {player.team}</>}
        </div>

        {/* Stars */}
        <div className="match-feedback-stars" aria-label="yıldız seç">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i} yıldız`}
              className="match-feedback-star-btn"
              onClick={() => setStars(i)}
            >
              {i <= stars ? "★" : "☆"}
            </button>
          ))}
          <strong className="match-feedback-star-val">{stars}★</strong>
        </div>

        {/* Etiketler */}
        <div className="match-feedback-tags">
          {PRESET_TAGS.map((t) => {
            const active = selectedTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                className={`mf-chip ${active ? "mf-chip-active" : ""}`}
                onClick={() => toggleTag(t)}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Serbest yorum alanı */}
        <div className="match-feedback-p-note">
          <textarea
            maxLength={MAX_LEN}
            value={freeText}
            placeholder="Kısa yorum (opsiyonel)"
            onChange={(e) => setFreeText(e.target.value)}
          />
          <div className="match-feedback-count">
            {freeText.length}/{MAX_LEN}
          </div>
        </div>

        <div className="match-feedback-fb-row">
          <button
            className="match-feedback-btn match-feedback-btn-sm"
            onClick={onSend}
            disabled={!canSend || sending}
          >
            {sending ? "Gönderiliyor..." : "Oyuncu Geri Bildirimini Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}
