"use client";
import { fmtDate, formatTL } from "@/lib/format";
import type { MatchDto } from "./types";

export default function MatchHero({ match, price }: { match: MatchDto; price: number }) {
  const { day, time } = fmtDate(match.matchTimestamp);

  return (
    <div className="match-hero">
      <div className="match-hero-inner">
        <div>
          <h1 className="match-hero-title">{match.fieldName}</h1>
          <div className="match-meta">
            <div className="meta-item"><span>📅</span><span>{day}</span></div>
            <div className="meta-item"><span>⏰</span><span>{time}</span></div>
            <div className="meta-item"><span>📍</span><span>{match.districtName ? `${match.city} / ${match.districtName}` : match.city}{match.address ? `, ${match.address}` : ""}</span></div>
          </div>
        </div>
        <div className="price-box">
          <div className="price-tag">{formatTL(price)}</div>
          <div className="price-label">Kişi Başı</div>
        </div>
      </div>
    </div>
  );
}
