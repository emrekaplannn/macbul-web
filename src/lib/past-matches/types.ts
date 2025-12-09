// lib/past-matches/types.ts
export type PastMatchItem = {
  matchId: string;
  team: "A" | "B";
  goals: number;
  assists: number;
  rating: number | null;
  mvp: boolean;
  time: number;
  venue: string;
  city: string;
  districtName?: string | null;
  scoreA: number;
  scoreB: number;
  winningTeam: "A" | "B" | "DRAW";
  position: string | null;
  durationMin: number;
};

export type PastMatchesResponse = {
  ok: boolean;
  filters: { range: string; result: string; venue: string; page: number; pageSize: number };
  summary: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    goals: number;
    assists: number;
    avgRating: number | null;
    successRate: number; // %
  };
  items: PastMatchItem[];
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
};
