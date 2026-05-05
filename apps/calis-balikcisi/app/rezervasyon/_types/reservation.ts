export type Zone = 'sea' | 'indoor';

export type TableStatus = 'free' | 'taken' | 'selected';

export type Table = {
  id: string;
  label: string;
  zone: Zone;
  x: number;
  y: number;
};

export type SelectedTable = {
  id: string;
  label: string;
  zone: Zone;
};

export type ReservationDraft = {
  tableId: string;
  date: string;
  time: string;
  partySize: number;
  guestName: string;
  guestPhone: string;
  allergyNote?: string;
};
