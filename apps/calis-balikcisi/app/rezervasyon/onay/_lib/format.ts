export type ReservationData = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  tableId: string | null;
  specialRequests: string;
};

export type ConfirmationState = {
  formattedDate: string;
  time: string;
  guests: string;
  tableLabel: string;
  code: string;
  rawDate: string;
};

export function isReservationData(value: unknown): value is ReservationData {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.phone === 'string' &&
    typeof v.date === 'string' &&
    typeof v.time === 'string' &&
    typeof v.guests === 'string' &&
    (v.tableId === null || typeof v.tableId === 'string') &&
    typeof v.specialRequests === 'string'
  );
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function parseTableLabel(tableId: string): string {
  const zone = tableId.charAt(0) === 'C' ? 'Sahil' : 'İç Mekan';
  const [row, col] = tableId.slice(1).split('-');
  return `${zone} • ${row}. sıra • ${col}. masa`;
}

export function generateCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const a = letters[Math.floor(Math.random() * 26)];
  const b = letters[Math.floor(Math.random() * 26)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${a}${b}${num}`;
}

export function buildICS(state: ConfirmationState): string {
  const start = new Date(`${state.rawDate}T${state.time}:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calis Balikcisi//Reservation//EN',
    'BEGIN:VEVENT',
    `UID:${state.code}@calisbalikcisi.com`,
    'SUMMARY:Çalış Balıkçısı Reservation',
    `DESCRIPTION:Reservation code ${state.code}\\nGuests ${state.guests}\\nTable ${state.tableLabel}`,
    'LOCATION:Çalış Plajı, Fethiye, Muğla',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
