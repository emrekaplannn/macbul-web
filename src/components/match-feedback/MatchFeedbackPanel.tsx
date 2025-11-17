"use client";
import React from "react";
import { submitMatchFeedback } from "@/lib/api/feedback";

type Props = { matchId: string };

export default function MatchFeedbackPanel({ matchId }: Props) {
  const [org, setOrg] = React.useState(3);
  const [facility, setFacility] = React.useState(4);
  const [fair, setFair] = React.useState<"GOOD" | "AVERAGE" | "BAD" | null>(null);
  const [app, setApp] = React.useState<"OK" | "SLOW" | "ERROR" | null>(null);
  const [note, setNote] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const canSend =
    (org >= 0 && facility >= 0) ||
    fair !== null ||
    app !== null ||
    note.trim().length > 0;

  const onSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await submitMatchFeedback({
        matchId,
        organizationQuality: org,
        facilityQuality: facility,
        fairPlay: (fair ?? "GOOD") as any, // server validasyonu var
        paymentAppExperience: (app ?? "OK") as any,
        comment: note || undefined,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="match-feedback-q-grid">
        <div className="match-feedback-q">
          <label>Organizasyon Kalitesi</label>
          <input
            className="match-feedback-range"
            type="range"
            min={0}
            max={5}
            step={1}
            value={org}
            onChange={(e) => setOrg(parseInt(e.target.value))}
          />
        </div>
        <div className="match-feedback-q">
          <label>Saha/Fasilite</label>
          <input
            className="match-feedback-range"
            type="range"
            min={0}
            max={5}
            step={1}
            value={facility}
            onChange={(e) => setFacility(parseInt(e.target.value))}
          />
        </div>
        <div className="match-feedback-q">
          <label>Adil Oyun (Fair Play)</label>
          <div className="match-feedback-radio-row">
            {["GOOD","AVERAGE","BAD"].map(v=>(
              <button
                key={v}
                type="button"
                onClick={()=>setFair(v as any)}
                className={`match-feedback-radio ${fair===v ? "match-feedback-active" : ""}`}
              >
                {v==="GOOD"?"İyi":v==="AVERAGE"?"Orta":"Kötü"}
              </button>
            ))}
          </div>
        </div>
        <div className="match-feedback-q">
          <label>Ödeme & Uygulama Deneyimi</label>
          <div className="match-feedback-radio-row">
            {["OK","SLOW","ERROR"].map(v=>(
              <button
                key={v}
                type="button"
                onClick={()=>setApp(v as any)}
                className={`match-feedback-radio ${app===v ? "match-feedback-active" : ""}`}
              >
                {v==="OK"?"Sorunsuz":v==="SLOW"?"Yavaş":"Hata Var"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label className="match-feedback-label">Genel Yorum (opsiyonel)</label>
        <textarea
          className="match-feedback-textarea"
          maxLength={255}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Maç genel değerlendirmeni yaz..."
        />
        <div className="match-feedback-count">{note.length}/255</div>
        <div className="match-feedback-fb-row" style={{ marginTop: ".5rem" }}>
          <button
            className="match-feedback-btn"
            onClick={onSend}
            disabled={!canSend || sending}
          >
            {sending ? "Gönderiliyor..." : "Maç Geri Bildirimini Gönder"}
          </button>
        </div>
      </div>
    </>
  );
}
