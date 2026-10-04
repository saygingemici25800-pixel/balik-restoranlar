/**
 * Mekânın dekor yerleşimi ve çarpışma kutuları — tek kaynak. `three` import ETMEZ.
 *
 * Yerleşim mekânın videosundan (karar 2026-10-02: "video esas"). Masalar YALNIZ DEKOR:
 * numara/etiket yok, tıklanmaz, yakınlık tetiklemez. Rezervasyon verisine artık bağlı değil.
 */
import {
  BORDER_Z,
  CABINET,
  CHAIR_OFFSET_X,
  CHAIR_OFFSET_Z,
  FACADE_DOORS,
  FACADE_Z,
  GATE_HALF,
  GRILL,
  HALF_W,
  KITCHEN,
  type Level,
  ROAD_Z_MIN,
  TABLE_HALF_X,
  TABLE_HALF_Z,
  WINE_CELLAR,
} from '@/lib/zone/frames';

export type Spot = { readonly x: number; readonly z: number };
/** Masa tarzı: dış teras (açık mavi örtü, beyaz sandalye), iç salon (bej döşemeli), üst kat (lacivert). */
export type TableStyle = 'outdoor' | 'indoor' | 'upper';
export type TableSpot = Spot & { readonly level: Level; readonly style: TableStyle };

const grid = (xs: readonly number[], zs: readonly number[]) => zs.flatMap((z) => xs.map((x) => ({ x, z })));

/** Dış teras: 3 sıra × 8 sütun. Orta koridor (x 0) sahil girişine ve cephenin orta kapısına hizalı. */
const OUT_X = [-9.1, -6.5, -3.9, -1.3, 1.3, 3.9, 6.5, 9.1];
const OUT_Z = [-11.1, -7.9, -4.8];
/** İç salon: 2 sıra; sütunlar cephe kapılarının (x −8.4 ve 0) önünde geçit bırakır. Reyon (x > 7) masasız. */
const IN_X = [-12.6, -10.2, -6.4, -4.0, -1.6, 1.6, 4.0];
const IN_Z = [-1.5, 1.5];
/** Üst kat: 3 sıra × 9 sütun; ön sıra cam cepheye yakın (videodaki gibi). */
const UP_X = [-10.4, -7.8, -5.2, -2.6, 0, 2.6, 5.2, 7.8, 10.4];
const UP_Z = [-1.2, 1.6, 4.4];

export const TABLES: readonly TableSpot[] = [
  ...grid(OUT_X, OUT_Z).map((s) => ({ ...s, level: 0 as const, style: 'outdoor' as const })),
  ...grid(IN_X, IN_Z).map((s) => ({ ...s, level: 0 as const, style: 'indoor' as const })),
  ...grid(UP_X, UP_Z).map((s) => ({ ...s, level: 1 as const, style: 'upper' as const })),
];

/**
 * Sandalye noktası: her masada uzun kenarların iki yanında ikişer. `side` −1 deniz tarafı (oturan
 * +z'ye, masaya bakar), +1 iç taraf (oturan −z'ye, denize bakar). Masalar ve misafirler bu tek
 * kaynaktan okur.
 */
export type ChairSpot = Spot & { readonly side: -1 | 1; readonly sx: -1 | 1 };
const SIDES = [-1, 1] as const;
export const chairSpots = (t: Spot): readonly ChairSpot[] =>
  SIDES.flatMap((side) =>
    SIDES.map((sx) => ({ x: t.x + sx * CHAIR_OFFSET_X, z: t.z + side * CHAIR_OFFSET_Z, side, sx })),
  );

/**
 * Büyük kare şemsiyeler (dış teras): direk masanın ortasından çıkar. Başlangıç kamerasının
 * tepesine binmesin diye orta koridorun üstü boş; ön sıra şemsiyesiz (deniz manzarası açık).
 */
export const UMBRELLAS: readonly Spot[] = [
  { x: -9.1, z: -7.9 },
  { x: -3.9, z: -7.9 },
  { x: 3.9, z: -7.9 },
  { x: 9.1, z: -7.9 },
  { x: -6.5, z: -4.8 },
  { x: 6.5, z: -4.8 },
];

/** Sahil yolu tarafındaki beyaz saksı sınırı (2 m'lik kutular), ortada giriş. */
export const BORDER_PLANTERS: readonly Spot[] = Array.from({ length: 15 }, (_, i) => -14 + i * 2)
  .filter((x) => Math.abs(x) > GATE_HALF + 0.9)
  .map((x) => ({ x, z: BORDER_Z }));

/** Beyaz yuvarlak saksıda ficus — dış terasın dört köşesi. */
export const FICUS: readonly Spot[] = [
  { x: -14.2, z: FACADE_Z - 0.8 },
  { x: 14.2, z: FACADE_Z - 0.8 },
  { x: -14.2, z: BORDER_Z + 0.8 },
  { x: 14.2, z: BORDER_Z + 0.8 },
];
export const FICUS_POT_R = 0.35;

/** Uzun beyaz saksıda dracaena (zemin kat içi): salonun köşeleri, ızgaranın yanı, reyon girişi. */
export const DRACAENA: readonly Spot[] = [
  { x: -14.2, z: 5.2 },
  { x: -14.2, z: -2.3 },
  { x: 5.0, z: 5.2 },
  { x: 8.0, z: -2.3 },
];
export const DRACAENA_POT_R = 0.28;

/** Üst kat: kapıya yakın iki ısıtıcı, tavanda vantilatör ve halatlı ahşap avizeler. */
export const HEATERS: readonly Spot[] = [
  { x: 14.2, z: 1.0 },
  { x: 14.2, z: 3.0 },
];
export const UPPER_FANS: readonly Spot[] = [
  { x: -9.1, z: 0.2 },
  { x: 9.1, z: 0.2 },
  { x: -9.1, z: 3.0 },
  { x: 9.1, z: 3.0 },
];
export const UPPER_CHANDELIERS: readonly Spot[] = [
  { x: -3.9, z: 0.2 },
  { x: 3.9, z: 0.2 },
  { x: -3.9, z: 3.0 },
  { x: 3.9, z: 3.0 },
];

/** Sahil: kumda hasır plaj şemsiyeleri, yol boyunca palmiyeler. */
export const BEACH_UMBRELLAS: readonly Spot[] = Array.from({ length: 12 }, (_, i) => ({
  x: -24 + i * 4.4,
  z: i % 2 ? -23.5 : -26,
}));
export const PALMS: readonly (Spot & { readonly y: number; readonly h: number; readonly lean: number })[] = [
  { x: -22, z: ROAD_Z_MIN - 0.6, y: 0, h: 6.4, lean: 0.1 },
  { x: -10, z: ROAD_Z_MIN - 0.6, y: 0, h: 5.8, lean: -0.06 },
  { x: 2, z: ROAD_Z_MIN - 0.6, y: 0, h: 6.6, lean: 0.08 },
  { x: 14, z: ROAD_Z_MIN - 0.6, y: 0, h: 6.0, lean: -0.1 },
  { x: 26, z: ROAD_Z_MIN - 0.6, y: 0, h: 6.2, lean: 0.06 },
];

/** Sahil yolu lambaları: yolun deniz kenarında, 8 m arayla. */
export const ROAD_LAMPS: readonly Spot[] = Array.from({ length: 11 }, (_, i) => ({
  x: -40 + i * 8,
  z: ROAD_Z_MIN + 0.6,
}));

/* ------------------------------ kamera engelleri ------------------------------ */

/**
 * Kameranın girmemesi gereken dikey şeyler, kat başına (`use-follow-camera` hedefi ve gerçek
 * konumu bu dairelerin dışına iter). Şemsiye direkleri kanopiye (2.8) kadar, ficus tepesi ~2.9 —
 * ikisi de kamera yüksekliğini (2.45) keser. Izgaranın bacası tavana çıkar.
 */
export type CameraPost = Spot & { readonly r: number };
export const CAMERA_POSTS: Record<Level, readonly CameraPost[]> = {
  0: [
    ...UMBRELLAS.map((u) => ({ ...u, r: 0.32 })),
    ...FICUS.map((f) => ({ ...f, r: 1.0 })),
    { x: GRILL.x, z: GRILL.z, r: 0.6 },
  ],
  1: [],
};

/* ------------------------------ çarpışma kutuları ------------------------------ */

/** Eksen hizalı kutu: merkez + yarı genişlikler (karakter yarıçapı EKLENMEMİŞ). */
export type Obstacle = { readonly x: number; readonly z: number; readonly hx: number; readonly hz: number };

const tableBox = (t: Spot): Obstacle => ({ x: t.x, z: t.z, hx: TABLE_HALF_X, hz: TABLE_HALF_Z });
const square = (s: Spot, r: number): Obstacle => ({ x: s.x, z: s.z, hx: r, hz: r });

/** Köşeleri verilen kutu. */
const span = (x0: number, x1: number, z0: number, z1: number): Obstacle => ({
  x: (x0 + x1) / 2,
  z: (z0 + z1) / 2,
  hx: (x1 - x0) / 2,
  hz: (z1 - z0) / 2,
});

/** Cephe duvarı: kapı açıklıklarının arasındaki parçalar (0.3 kalın). */
function facadeSegments(): Obstacle[] {
  const edges = [-HALF_W, ...FACADE_DOORS.flat(), HALF_W];
  const out: Obstacle[] = [];
  for (let i = 0; i < edges.length; i += 2) {
    const a = edges[i];
    const b = edges[i + 1];
    if (a === undefined || b === undefined || b <= a) continue;
    out.push({ x: (a + b) / 2, z: FACADE_Z, hx: (b - a) / 2, hz: 0.15 });
  }
  return out;
}

export const OBSTACLES: Record<Level, readonly Obstacle[]> = {
  0: [
    ...TABLES.filter((t) => t.level === 0).map(tableBox),
    ...facadeSegments(),
    span(CABINET.x0, CABINET.x1, CABINET.z - CABINET.depth / 2, CABINET.z + CABINET.depth / 2),
    span(WINE_CELLAR.x0, WINE_CELLAR.x1, WINE_CELLAR.z0, WINE_CELLAR.z1),
    span(KITCHEN.wall.x0, HALF_W, KITCHEN.wall.z0, KITCHEN.wall.z1),
    span(KITCHEN.island.x0, KITCHEN.island.x1, KITCHEN.island.z0, KITCHEN.island.z1),
    span(KITCHEN.sink.x0, KITCHEN.sink.x1, KITCHEN.sink.z0, KITCHEN.wall.z1),
    { x: GRILL.x, z: GRILL.z, hx: GRILL.w / 2, hz: GRILL.d / 2 },
    ...FICUS.map((f) => square(f, FICUS_POT_R)),
    ...DRACAENA.map((d) => square(d, DRACAENA_POT_R)),
  ],
  1: [...TABLES.filter((t) => t.level === 1).map(tableBox), ...HEATERS.map((h) => square(h, 0.3))],
};
