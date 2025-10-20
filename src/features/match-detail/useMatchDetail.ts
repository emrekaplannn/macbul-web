"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DetailPayload, MatchDto, MatchParticipantDto, MatchSlotsDto, WalletDto } from "./types";
import { authFetch } from "@/lib/authFetch";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const dbg = (...args: any[]) => { if (DEBUG) console.debug("[useMatchDetail]", ...args); };

export function useMatchDetail(id: string) {
  const [wallet, setWallet] = useState<number | null>(null);
  const [match, setMatch] = useState<MatchDto | null>(null);
  const [slots, setSlots] = useState<MatchSlotsDto | null>(null);
  const [players, setPlayers] = useState<MatchParticipantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const prev = useRef<{ loading?: boolean; err?: string | null }>({});

  // ---- yardımcı: JSON fetch + süre ölçümü
async function fetchJSON<T>(input: RequestInfo | URL, init?: RequestInit): Promise<{ data: T; res: Response; took: number }> {
  const t0 = DEBUG ? performance.now() : 0;
  const res = await authFetch(input, { cache: "no-store", ...init });
  let data: any = {};
  try { data = await res.json(); } catch { /* yut */ }
  const took = DEBUG ? Math.round(performance.now() - t0) : 0;
  return { data, res, took };
}  // ---- bakiye
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        dbg("wallet:fetch:start");
        const { data, res, took } = await fetchJSON<{ wallet?: WalletDto }>("/api/wallet");
        dbg("wallet:fetch:end", { status: res.status, ok: res.ok, took_ms: took, keys: Object.keys(data || {}) });
        if (res.ok && data?.wallet && alive) {
          const w = data.wallet;
          const num = typeof w.balance === "string" ? Number(w.balance) : w.balance;
          const val = Number.isFinite(num) ? (num as number) : 0;
          setWallet(val);
          dbg("wallet:set", { val });
        } else if (!res.ok && alive) {
          dbg("wallet:nonok", { status: res.status, body: data });
        }
      } catch (e) {
        dbg("wallet:error", e);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ---- detay
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setErr(null);
    dbg("detail:fetch:start", { id });

    try {
      const { data, res, took } = await fetchJSON<DetailPayload>(`/api/matches/${id}`);
      dbg("detail:fetch:end", {
        status: res.status, ok: res.ok, took_ms: took,
        has: {
          ok: !!(data as any)?.ok,
          match: !!data?.match, slots: !!data?.slots,
          participants: Array.isArray(data?.participants) ? data?.participants.length : "noarr",
        }
      });

      if (!res.ok || !data?.ok) {
        const msg = (data as any)?.message || "Maç detayı alınamadı";
        throw new Error(msg);
      }

      setMatch(data.match);
      setSlots(data.slots);
      setPlayers(Array.isArray(data.participants) ? data.participants : []);
      dbg("detail:set", {
        matchId: data.match?.id,
        city: data.match?.city,
        pricePerUser: data.match?.pricePerUser,
        players: Array.isArray(data.participants) ? data.participants.length : 0
      });
    } catch (e: any) {
      const msg = e?.message ?? "Hata";
      setErr(msg);
      dbg("detail:error", { id, msg, error: e });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    dbg("effect:fetchDetail", { id });
    fetchDetail();
  }, [fetchDetail]);

  // ---- türetilmiş ücret
  const priceNumber = useMemo(() => {
    const raw = match?.pricePerUser;
    const n = typeof raw === "string" ? Number(raw) : raw || 0;
    const val = Number.isFinite(n) ? (n as number) : 0;
    dbg("memo:priceNumber", { raw, val });
    return val;
  }, [match?.pricePerUser]);

  // ---- join akışı
  const join = useCallback(async () => {
    dbg("join:start", { id });
    const { data, res, took } = await fetchJSON<{ ok?: boolean; message?: string }>(`/api/matches/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: id }),
    });
    dbg("join:end", { status: res.status, ok: res.ok, took_ms: took, body_ok: data?.ok, message: data?.message });

    if (!res.ok || !data?.ok) {
      const msg = data?.message || "Katılım başarısız";
      dbg("join:fail", { msg });
      throw new Error(msg);
    }

    // slots/players yenile
    await fetchDetail();

    // bakiye yenile
    try {
      dbg("wallet:refresh:start");
      const { data: wd, res: wr, took: wt } = await fetchJSON<{ wallet?: WalletDto }>("/api/wallet");
      dbg("wallet:refresh:end", { status: wr.status, ok: wr.ok, took_ms: wt, has_wallet: !!wd?.wallet });
      if (wr.ok && wd?.wallet) {
        const num = Number(wd.wallet.balance);
        if (Number.isFinite(num)) {
          setWallet(num);
          dbg("wallet:set", { val: num });
        }
      }
    } catch (e) {
      dbg("wallet:refresh:error", e);
    }
  }, [id, fetchDetail]);

  // ---- state geçiş logları
  useEffect(() => {
    if (prev.current.loading !== loading) {
      dbg("state:loading", { from: prev.current.loading, to: loading });
      prev.current.loading = loading;
    }
  }, [loading]);

  useEffect(() => {
    if (prev.current.err !== err) {
      dbg("state:err", { from: prev.current.err, to: err });
      prev.current.err = err;
    }
  }, [err]);

  // ---- önemli veri değişimleri
  useEffect(() => { if (match) dbg("data:match", { id: match.id, city: match.city, ts: match.matchTimestamp }); }, [match]);
  useEffect(() => { if (slots) dbg("data:slots", slots); }, [slots]);
  useEffect(() => { if (players) dbg("data:players", { count: players.length, sample: players.slice(0, 3) }); }, [players]);
  useEffect(() => { if (wallet !== null) dbg("data:wallet", { wallet }); }, [wallet]);

  return { wallet, match, slots, players, priceNumber, loading, err, join };
}
