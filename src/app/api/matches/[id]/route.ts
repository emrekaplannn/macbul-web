import { NextResponse } from "next/server";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const sdbg = (...args: any[]) => { if (DEBUG) console.debug("[API /matches/:id]", ...args); };

// ---- DTO tipleri (opsiyonel, sadece doğrulama/okunabilirlik için)
type MatchDto = {
  id: string;
  organizerId: string;
  fieldName: string;
  address: string;
  city: string;
  matchTimestamp: number;
  pricePerUser: string | number;
  totalSlots: number;
  createdAt: number;
};

type MatchSlotsDto = {
  matchId: string;
  totalSlots: number;
  paidCount: number;
  remaining: number;
  full: boolean;
};

type MatchParticipantDto = {
  id: string;
  matchId: string;
  userId: string;
  teamId?: string | null;
  joinedAt?: number | null;
  hasPaid: boolean;
};

type DetailPayload = {
  ok: boolean;
  match: MatchDto;
  slots: MatchSlotsDto;
  participants: MatchParticipantDto[];
};

// ---- Geçici MOCK (kendi DB çağrınla değiştir)
const MOCK_MATCH: Record<string, MatchDto> = {
  "c3f3e0c3-9d33-4eac-9233-9f8daeac3003": {
    id: "c3f3e0c3-9d33-4eac-9233-9f8daeac3003",
    organizerId: "b69787b8-b644-43f6-b5dd-f508cacbd467",
    fieldName: "Beşiktaş Halısaha",
    address: "Beşiktaş, İstanbul",
    city: "istanbul",
    matchTimestamp: Date.now() + 60 * 60 * 1000, // +1 saat
    pricePerUser: 120,
    totalSlots: 10,
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
  },
};

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const t0 = DEBUG ? performance.now() : 0;
  const id = ctx?.params?.id;

  sdbg("GET:start", { id });

  try {
    // ⬇️ Burayı servis/DB çağrınla değiştir
    const match = MOCK_MATCH[id];

    if (!match) {
      const took = DEBUG ? Math.round(performance.now() - t0) : 0;
      sdbg("GET:not-found", { id, took_ms: took });
      return NextResponse.json({ ok: false, message: "Match not found" }, { status: 404 });
    }

    // Slots örneği
    const paidCount = 6;
    const slots: MatchSlotsDto = {
      matchId: match.id,
      totalSlots: match.totalSlots,
      paidCount,
      remaining: Math.max(0, match.totalSlots - paidCount),
      full: paidCount >= match.totalSlots,
    };

    // Participants örneği
    const participants: MatchParticipantDto[] = [
      { id: "p1", matchId: match.id, userId: "u1", hasPaid: true, joinedAt: Date.now() - 1000 * 60 * 20 },
      { id: "p2", matchId: match.id, userId: "u2", hasPaid: false, joinedAt: Date.now() - 1000 * 60 * 10 },
    ];

    const took = DEBUG ? Math.round(performance.now() - t0) : 0;
    sdbg("GET:success", {
      id,
      took_ms: took,
      payload: { match: true, slots: true, participants: participants.length },
    });

    const body: DetailPayload = {
      ok: true,
      match,
      slots,
      participants,
    };

    return NextResponse.json(body);
  } catch (e: any) {
    const took = DEBUG ? Math.round(performance.now() - t0) : 0;
    sdbg("GET:error", { id, took_ms: took, error: e?.message || e });
    return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
  }
}
