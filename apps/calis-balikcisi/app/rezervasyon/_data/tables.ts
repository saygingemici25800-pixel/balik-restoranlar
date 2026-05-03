import type { Table } from '../_types/reservation';

function buildSeaTables(): Table[] {
  const out: Table[] = [];
  let id = 1;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++) {
      out.push({
        id: `D${id}`,
        label: `Masa D${id}`,
        zone: 'sea',
        x: -315 + col * 70,
        y: -38 + row * 32,
      });
      id++;
    }
  }
  return out;
}

function buildIndoorTables(): Table[] {
  // 2 sıra × 9 sütun = 18 masa. x koordinatları dış (sea) masaların 9
  // boşluğuna denk gelir: deniz masaları -315 + col*70 (col 0..9), boşluk
  // orta noktaları -280 + col*70 (col 0..8). Her iç masa böylece üstündeki
  // iki dış masanın tam ortasında kalır (35px sol, 35px sağ).
  const out: Table[] = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 9; col++) {
      const i = row * 9 + col + 1;
      out.push({
        id: `S${i}`,
        label: `Masa S${i}`,
        zone: 'indoor',
        x: -280 + col * 70,
        y: 50 + row * 28,
      });
    }
  }
  return out;
}

export const SEA_TABLES: Table[] = buildSeaTables();
export const INDOOR_TABLES: Table[] = buildIndoorTables();
export const ALL_TABLES: Table[] = [...SEA_TABLES, ...INDOOR_TABLES];

export const TABLES_BY_ID: Record<string, Table> = ALL_TABLES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, Table>,
);

export const ZONE_LABEL: Record<Table['zone'], string> = {
  sea: 'deniz kenarı',
  indoor: 'iç salon',
};
