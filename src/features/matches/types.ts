export type MatchStatus = "available" | "filling" | "full";

/** Backend DTO: MatchListItemDto */
export interface MatchListItemDto {
  id: string;
  fieldName: string;
  city: string;
  matchTimestamp: number;   // epoch millis
  pricePerUser: number;     // BigDecimal -> number (JSON'da sayı geliyor)
  totalSlots: number;
  filledSlots: number;
  isUserJoined: boolean;
}

/** UI'da kullanacağımız sade tip (türetilmiş alanlarla) */
export interface MatchItem {
  id: string;
  isoDate: string;          // UI rahat formatlasın diye
  price: number;            // TL
  venueName: string;        // fieldName
  city: string;
  capacity: number;         // totalSlots
  joined: number;           // filledSlots
  isUserJoined: boolean;
  status: MatchStatus;      // joined/capacity oranından hesaplıyoruz
}
