export type MatchStatus = "available" | "filling" | "full";

/** Backend DTO: MatchListItemDto */
export interface MatchListItemDto {
  id: string;
  fieldName: string;
  city: string;              // enum City -> JSON'da string
  districtName: string | null;
  matchTimestamp: number;    // epoch millis
  pricePerUser: number;
  totalSlots: number;
  filledSlots: number;
  isUserJoined: boolean;
}

/** UI'da kullanacağımız sade tip (türetilmiş alanlarla) */
export interface MatchItem {
  id: string;
  isoDate: string;        // UI rahat formatlasın diye
  price: number;          // TL
  fieldName: string;      // fieldName
  city: string;           // enum string
  districtName: string | null; // yeni alan
  capacity: number;       // totalSlots
  joined: number;         // filledSlots
  isUserJoined: boolean;
  status: MatchStatus;
}
