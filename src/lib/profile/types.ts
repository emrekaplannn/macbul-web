// lib/profile/types.ts
export type ProfileApiResponse = {
  ok: boolean;
  me: {
    id: string;
    email: string;
    emailVerified?: boolean;
    displayName?: string;
    fullName?: string;
    bio?: string;
    location?: string;
    position?: string;
    overall?: number;
  };
  stats: {
    totalMatches: number;
    goals: number;
    assists: number;
    avgRating: number | null;
    motm: number;
    overall: number;
  };
  recent: Array<{
    matchId: string;
    fieldName: string;
    city: string;
    time: number;
    scoreA: number;
    scoreB: number;
    winningTeam: "A" | "B" | "DRAW";
    my: { goals: number; assists: number; rating: number | null; team: "A" | "B" };
  }>;
  trend: number[]; // son 10 maç rating
};
