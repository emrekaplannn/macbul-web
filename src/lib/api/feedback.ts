// src/lib/api/feedback.ts

export type PlayerFeedbackUpsert = {
  matchId: string;
  targetId: string;       // reviewerId token’dan
  overallRating: number;  // 0-5
  comment?: string;
};

export type MatchFeedbackUpsert = {
  matchId: string;
  organizationQuality: number; // 0-5
  facilityQuality: number;     // 0-5
  fairPlay: "GOOD" | "AVERAGE" | "BAD";
  paymentAppExperience: "OK" | "SLOW" | "ERROR";
  comment?: string;
};

// Artık Next.js API route'larına vuruyoruz:
const PLAYER_FEEDBACK_URL = "/api/feedback/player";
const MATCH_FEEDBACK_URL = "/api/feedback/match";

export async function submitPlayerFeedback(payload: PlayerFeedbackUpsert) {
  const url = PLAYER_FEEDBACK_URL;

  if (typeof window !== "undefined") {
    console.log("[submitPlayerFeedback] URL:", url);
    console.log("[submitPlayerFeedback] Payload:", payload);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // BFF route olduğu için direkt payload'ı gönderiyoruz
    body: JSON.stringify({
      matchId: payload.matchId,
      targetId: payload.targetId,
      overallRating: payload.overallRating,
      comment: payload.comment,
    }),
  });

  const rawBody = await res.text();

  if (typeof window !== "undefined") {
    console.log("[submitPlayerFeedback] Status:", res.status, res.statusText);
    console.log("[submitPlayerFeedback] Raw response body:", rawBody);
  }

  if (!res.ok) {
    throw new Error(
      `Player feedback failed: ${res.status} ${res.statusText} - ${rawBody}`
    );
  }

  // Event: özet kartını güncellemek istersen
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("player-feedback-sent"));
  }

  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody as unknown;
  }
}

export async function submitMatchFeedback(payload: MatchFeedbackUpsert) {
  const url = MATCH_FEEDBACK_URL;

  if (typeof window !== "undefined") {
    console.log("[submitMatchFeedback] URL:", url);
    console.log("[submitMatchFeedback] Payload:", payload);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Burada payload'ı aynen proxy'ye forward ediyoruz
    body: JSON.stringify(payload),
  });

  const rawBody = await res.text();

  if (typeof window !== "undefined") {
    console.log("[submitMatchFeedback] Status:", res.status, res.statusText);
    console.log("[submitMatchFeedback] Raw response body:", rawBody);
  }

  if (!res.ok) {
    throw new Error(
      `Match feedback failed: ${res.status} ${res.statusText} - ${rawBody}`
    );
  }

  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody as unknown;
  }
}
