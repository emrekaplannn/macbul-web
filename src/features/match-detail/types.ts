export type MatchDto = {
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

export type MatchSlotsDto = {
  matchId: string;
  totalSlots: number;
  paidCount: number;
  remaining: number;
  full: boolean;
};

export type MatchParticipantDto = {
  id: string;
  matchId: string;
  userId: string;
  teamId?: string | null;
  joinedAt?: number | null;
  hasPaid: boolean;
};

export type WalletDto = { id: string; userId: string; balance: string | number; updatedAt: number };

export type DetailPayload = {
  ok: boolean;
  match: MatchDto;
  slots: MatchSlotsDto;
  participants: MatchParticipantDto[];
};

export type JoinResponse = { ok: boolean; participant?: MatchParticipantDto; message?: string };
