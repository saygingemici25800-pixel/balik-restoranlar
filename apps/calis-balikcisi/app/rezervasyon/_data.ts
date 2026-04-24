export type TableZone = 'coast' | 'indoor';

export type Table = {
  id: string;
  label: string;
  zone: TableZone;
  row: number;
  col: number;
};

function buildZoneTables(
  zone: TableZone,
  rows: number,
  cols: number,
): Table[] {
  const prefix = zone === 'coast' ? 'C' : 'I';
  const tables: Table[] = [];
  let label = 1;
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      tables.push({
        id: `${prefix}${row}-${col}`,
        label: String(label++),
        zone,
        row,
        col,
      });
    }
  }
  return tables;
}

export const COAST_TABLES: Table[] = buildZoneTables('coast', 3, 5);
export const INDOOR_TABLES: Table[] = buildZoneTables('indoor', 2, 5);

export const TIME_SLOTS = [
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
] as const;

export const GUEST_OPTIONS: string[] = Array.from({ length: 12 }, (_, i) =>
  String(i + 1),
);
