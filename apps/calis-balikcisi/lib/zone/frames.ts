/**
 * Zone — TEK DOĞRULUK KAYNAĞI: mekân ölçüleri, sahne renkleri, kamera sabitleri
 * (docs/zone-3d-modul.md bölüm 4).
 *
 * `three` import ETMEZ. Kapı gibi ana sayfaya statik giren modüller de bunu okuyabilir;
 * three'yi dolaylı yoldan ana sayfaya taşımaz (bölüm 10, sızıntı dersi).
 *
 * **Yerleşim mekânın videosundan** (karar 2026-10-02: "video esas"; rezervasyon haritası artık
 * kaynak değil, rezervasyon koduna yine dokunulmaz). İki kat, aynı sahnede üst üste:
 *
 *  ZEMİN (y 0)                                    ÜST KAT TERAS (y 4)
 *  ~ ~ ~ ~ deniz + körfez dağları (−z) ~ ~ ~ ~     ┌──── cam ön cephe (z −3) ────┐
 *  . . . . . . . kum + plaj şemsiyesi . . . . .    │  lacivert örtülü masalar     │ cam
 *  ══════════════ sahil yolu ══════════════════    │                              │ yan
 *  ▭▭▭▭▭▭▭ saksı sınırı ─┤giriş├─ ▭▭▭▭▭▭▭▭▭▭  z −13 │      ☐ Gün Batımı panosu     │ kapı→merdiven
 *  │ İletişim  dış teras: beyaz sandalye,        │ │                              │
 *  │ panosu    açık mavi örtü, şemsiyeler         │ └── dalga resimli arka duvar ──┘
 *  ├──── cam cephe + tabela (z −3), 3 kapı ─────┤
 *  │ iç salon: bej sandalye, kumaş dalga  │ kav ▤ │ ║ merdiven (x +17, dış)
 *  │                                      │ vitrin│ ║ vitrinin yanındaki kapıdan
 *  │   ☐ Menü panosu        ızgara ▣      │ mutfak│ ║ yürüme yoluyla, yukarı (y 0 → 4)
 *  └──────────────── arka duvar (z 6) ────┴───────┘
 */

export type FrameId = 'reyon' | 'gunbatimi' | 'menu' | 'iletisim';
export type PortalId = 'up' | 'down';
/** 0 zemin kat · 1 üst kat teras. */
export type Level = 0 | 1;

/** Katların zemin yüksekliği. Üst kat zemin katın tavanının (3.2) ve döşemesinin üstünde. */
export const LEVEL_Y: Record<Level, number> = { 0: 0, 1: 4 };

/* ---------------------------------- bina ---------------------------------- */

/** Bina ve dış teras x: −15..15. */
export const HALF_W = 15;
/** Zemin kat cam cephesi (deniz tarafı) ve üst katın cam ön yüzü. */
export const FACADE_Z = -3;
/** Arka duvar. */
export const BACK_Z = 6;
/** Zemin kat tavanı; 3.2–4.0 arası döşeme (önünde tabela bandı). */
export const GROUND_CEIL = 3.2;
/** Üst kat lamelli çatısı (zemininden 3.4 m yukarıda — ayaklı pano 3.2'ye çıkar, çatıyı delmesin). */
export const UPPER_ROOF_Y = LEVEL_Y[1] + 3.4;

/** Cephedeki kapı açıklıkları (x aralıkları). Masa sütunları bunların arasından geçit bırakır. */
export const FACADE_DOORS: readonly (readonly [number, number])[] = [
  [-9.4, -7.4],
  [-1, 1],
  [10, 12],
];

/**
 * Reyon kanadı (x > 7), +x uç duvarına bakınca soldan sağa: cam cephenin hemen içinde açık şarap
 * kavı, önünde uç duvara DİK duran vitrin (camı kava, yani cepheye bakar; arkası personel
 * tarafı), vitrinden sonra merdiven kapısı, kapının sağında uç duvarın kalanı boyunca açık mutfak.
 */
export const REYON_X = 7;
export const CABINET = { x0: 10.6, x1: 14.95, z: -1.0, depth: 0.9, h: 1.25 } as const;
/** Açık şarap kavı: cephe camının içinde, boylu boyunca; arkası açık (dışarıdan şişe dipleri görünür). */
export const WINE_CELLAR = { x0: 12.25, x1: 14.9, z0: -2.82, z1: -2.4, h: 2.15 } as const;
/**
 * Açık mutfak (kapının sağı): uç duvar boyunca tezgâh + ocak ve davlumbaz, salona bakan pas
 * tezgâhı (ısıtma lambalı), arka duvarda evye tezgâhı. Davlumbaz ve lambalar kamera boyunun
 * (2.45) üstünde: kamera engeli gerekmez.
 */
export const KITCHEN = {
  h: 0.92,
  wall: { x0: 14.3, z0: 1.7, z1: 5.98 },
  range: { z0: 3.2, z1: 4.4 },
  island: { x0: 12.0, x1: 12.8, z0: 2.2, z1: 5.0 },
  sink: { x0: 12.0, x1: 14.3, z0: 5.35 },
} as const;
/** Közlü ızgara (soba + baca), salonla reyonun birleştiği yerde, arka duvar dibinde. */
export const GRILL = { x: 6.4, z: 5.1, w: 1.1, d: 0.8, h: 1.4 } as const;
/** Merdivene çıkan kapı: uç duvarda (x = 15), vitrinin hemen sağında. */
export const STAIR_DOOR_Z: readonly [number, number] = [-0.1, 1.1];

/* -------------------------------- dış teras -------------------------------- */

/** Sahil yolu tarafındaki saksı sınırı; ortada giriş. */
export const BORDER_Z = -13;
export const GATE_HALF = 1.1;

/** Sahil yolu ve kum. */
export const ROAD_Z_MIN = -19;
export const ROAD_Z_MAX = BORDER_Z - 0.4;
export const SAND_Z_MIN = -31;
export const SAND_Y = -0.3;
/** Deniz seviyesi: kum kıyıda denize iner. */
export const SEA_Y = -0.6;

/* -------------------------------- dış merdiven -------------------------------- */

/**
 * Binanın +x yanında, açık havada: zemin kapısından (z ≈ 0.5) duvar dibindeki yürüme yoluna
 * çıkılır, yol boyunca arkaya yürünüp merdivenin dibinden denize doğru (−z) yükselinir;
 * sahanlıktan köprüyle (y 4) üst katın yan kapısına girilir. Videodaki mavi demir korkuluklu beton
 * merdiven. Görseldir; katlar arası geçiş halka + prompt ile (portal).
 */
export const STAIR = { xMin: 16.85, xMax: 18.15, zBottom: 5.6, zTop: -0.6, landingZ: -2.1, steps: 22 } as const;
/** Zemin kapısından merdiven dibine giden yürüme yolu (bina ile merdiven arası). */
export const STAIR_WALK = { x0: 15.0, x1: STAIR.xMin, z0: STAIR.landingZ, z1: STAIR.zBottom + 0.8 } as const;
export const UPPER_SIDE_DOOR_Z: readonly [number, number] = [-2.0, -0.6];

/* ------------------------------- dekor ölçüleri ------------------------------- */

/** Masa + 4 sandalye. İz (footprint) çarpışma kutusudur; sandalyeler z yönünde iki yanda. */
export const TABLE_W = 1.0;
export const TABLE_D = 0.8;
export const TABLE_H = 0.75;
export const CHAIR_W = 0.4;
export const CHAIR_D = 0.38;
export const CHAIR_SEAT_H = 0.45;
export const CHAIR_BACK_H = 0.45;
export const CHAIR_OFFSET_Z = 0.58;
export const CHAIR_OFFSET_X = 0.24;
export const TABLE_HALF_X = TABLE_W / 2;
export const TABLE_HALF_Z = CHAIR_OFFSET_Z + CHAIR_D / 2;

/** Dış teras şemsiyesi: kanopi kenarı kameranın (2.45) üstünde. */
export const UMBRELLA = { edgeY: 2.8, peakY: 3.25, size: 3.0 } as const;

/* ------------------------------- panolar (Faz 3) ------------------------------- */

/** `story`: görsel + metin (+ bağlantı). `contact`: aynı kart + arama/harita/WhatsApp eylemleri. */
export type BoardKind = 'story' | 'contact';

/**
 * Pano bir duvarın önünde ayaklı durur. `x/z`: pano yüzünün merkezi (duvardan 12 cm önde);
 * `nx/nz`: yüzün baktığı yön (birim vektör, mekânın içine). MANCH'teki `side` (±x) bunun özel hâli.
 */
export type ZoneFrame = {
  readonly id: FrameId;
  readonly level: Level;
  readonly x: number;
  readonly z: number;
  readonly nx: number;
  readonly nz: number;
  readonly kicker: string;
  readonly title: string;
  readonly board: BoardKind;
  /** Pano yüzündeki görsel. `null`: dokusu koddan çizilir (iletişim kartı). */
  readonly art: string | null;
};

const WALL_GAP = 0.12;

/**
 * Dört ayaklı pano — TEK DOĞRULUK KAYNAĞI. Yerleri mekânın gerçek düzenine göre: reyon
 * vitrinin yanında, menü salonda, iletişim dış terasın sahil girişine yakın, gün batımı üst
 * kat terasta. Kart içerikleri `lib/zone/board-content.ts`'te, id ile eşlenir.
 */
export const ZONE_FRAMES: readonly ZoneFrame[] = [
  { id: 'iletisim', level: 0, x: -HALF_W + WALL_GAP, z: -8, nx: 1, nz: 0, kicker: '01 · İletişim', title: 'Bize Ulaşın', board: 'contact', art: null },
  { id: 'menu', level: 0, x: -4, z: BACK_Z - WALL_GAP, nx: 0, nz: -1, kicker: '02 · Sofra', title: 'Menü', board: 'story', art: '/web/meze-detay.webp' },
  { id: 'reyon', level: 0, x: 9.6, z: BACK_Z - WALL_GAP, nx: 0, nz: -1, kicker: '03 · Tezgâh', title: 'Balık Reyonu', board: 'story', art: '/web/balik-reyonu-1.webp' },
  { id: 'gunbatimi', level: 1, x: -HALF_W + WALL_GAP, z: 0.5, nx: 1, nz: 0, kicker: '04 · Teras', title: 'Gün Batımı', board: 'story', art: '/web/gunbatimi-teras.webp' },
];

/** Pano: 1.6 × 2.0, merkez 2.15 (alt kenar 1.15) — ayaklar yere iner. */
export const BOARD_W = 1.6;
export const BOARD_H = 2.0;
export const BOARD_Y = 2.15;
/** Pano yüzündeki görsel alanı (paspartu payı düşülmüş) — doku kırpmasında da kullanılır. */
export const ART_W = BOARD_W - 0.16;
export const ART_H = BOARD_H - 0.16;

/** Yakınlık yarıçapı; halka görünür yarıçapı (2.3) bunun İÇİNDE kalır (bölüm 7.2). */
export const FRAME_PROXIMITY = 2.6;
export const MARKER_SIZE = 4.6;
/** Prompt pano alt kenarının hemen altında, panodan 0.9 önde; kutu aşağı sarkar (bölüm 7.3). */
export const PROMPT_HEIGHT = BOARD_Y - BOARD_H / 2 - 0.05;
export const PROMPT_FORWARD = 0.9;
/** Durma noktası panodan 1.48 önde (MANCH: duvar −0.12 ile −1.6 arası). */
const STOP_FORWARD = 1.48;

export const POV_DISTANCE = 3.25;
export const POV_LERP = 0.055;
/** POV kamerası pano merkezinin hizasında (kat yüksekliği eklenir). */
export const POV_HEIGHT = BOARD_Y;

/** Panonun önündeki durma noktası — yakınlık, halka ve prompt buna göre (x, y, z). */
export function frameStop(f: ZoneFrame): [number, number, number] {
  return [f.x + f.nx * STOP_FORWARD, LEVEL_Y[f.level], f.z + f.nz * STOP_FORWARD];
}

export function promptAnchor(f: ZoneFrame): [number, number, number] {
  return [f.x + f.nx * PROMPT_FORWARD, LEVEL_Y[f.level] + PROMPT_HEIGHT, f.z + f.nz * PROMPT_FORWARD];
}

/** POV kamera hedefi ve bakış noktası (bölüm 5.3). */
export function povTargets(f: ZoneFrame) {
  const y = LEVEL_Y[f.level] + POV_HEIGHT;
  return {
    camTarget: [f.x + f.nx * POV_DISTANCE, y, f.z + f.nz * POV_DISTANCE] as [number, number, number],
    lookTarget: [f.x, y, f.z] as [number, number, number],
  };
}

export const getFrame = (id: FrameId) => ZONE_FRAMES.find((f) => f.id === id);

/* ------------------------------ katlar arası geçiş ------------------------------ */

/**
 * Merdiven geçidi: halkaya basılır, "Terasa çık" / "Aşağı in" prompt'u, E ya da tık → kısa
 * kararma ile diğer kata geçilir. Halka panolarınkinden küçük (yarıçap 1.2 < tetikleme 1.4).
 * `to`: varış noktası ve bakış yönü (açı: 0 = +z, −π/2 = −x).
 */
export type ZonePortal = {
  readonly id: PortalId;
  readonly level: Level;
  readonly x: number;
  readonly z: number;
  readonly label: string;
  readonly to: { readonly level: Level; readonly x: number; readonly z: number; readonly ang: number };
};

export const PORTAL_PROXIMITY = 1.4;
export const PORTAL_MARKER_SIZE = 2.4;

/**
 * Varış noktası diğer kattaki geçidin halkasının DIŞINDA (> 1.4) ve reyon panosunun tetikleme
 * alanının dışında: varınca hemen geri dönüş prompt'u açılmaz (inceleme: E basılı tutulunca
 * katlar arası sekme).
 */
export const ZONE_PORTALS: readonly ZonePortal[] = [
  { id: 'up', level: 0, x: 13.5, z: 0.5, label: 'Terasa çık', to: { level: 1, x: 11.9, z: -1.3, ang: -Math.PI / 2 } },
  { id: 'down', level: 1, x: 13.6, z: -1.3, label: 'Aşağı in', to: { level: 0, x: 11.9, z: 0.5, ang: -Math.PI / 2 } },
];

export const getPortal = (id: PortalId) => ZONE_PORTALS.find((p) => p.id === id);

/* ------------------------------- yürünebilir ------------------------------- */

export type Bounds = { readonly xMin: number; readonly xMax: number; readonly zMin: number; readonly zMax: number };

/**
 * Kat başına yürüme sınırı. Zemin: saksı sınırından arka duvara (cephe duvarı ve masalar
 * çarpışma kutusu, kapılardan geçilir). Üst kat: cam odanın içi.
 */
export const WALK_BOUNDS: Record<Level, Bounds> = {
  0: { xMin: -HALF_W + 1, xMax: HALF_W - 1, zMin: BORDER_Z + 0.9, zMax: BACK_Z - 0.6 },
  1: { xMin: -HALF_W + 1, xMax: HALF_W - 1, zMin: FACADE_Z + 0.6, zMax: BACK_Z - 0.6 },
};
/** Kat zemininin dikdörtgeni: zemin halkaları bunun dışına taşmaz (duvar/cam dışına kırpılır). */
export const FLOOR_RECT: Record<Level, Bounds> = {
  0: { xMin: -HALF_W, xMax: HALF_W, zMin: BORDER_Z - 0.4, zMax: BACK_Z },
  1: { xMin: -HALF_W, xMax: HALF_W, zMin: FACADE_Z, zMax: BACK_Z },
};
export const SPEED = 4.6;
/** Karakterin çarpışma yarıçapı (sprite 1.3 geniş ama gövde dar). */
export const CHAR_RADIUS = 0.28;

/* ---------------------------------- kamera --------------------------------- */

export const CAMERA_FOV = 48;
export const CAMERA_NEAR = 0.1;
/** Gökyüzü kubbesinin tamamı görüş mesafesinde kalmalı. */
export const CAMERA_FAR = 420;

/**
 * Kamera sınırı yürüme sınırının yeterince GERİSİNDE olmalı (MANCH: 4.2 birim pay) — yoksa kamera
 * sınıra dayanır, karakter altına yürür ve kadrajdan çıkar (Faz 1 incelemesi).
 *
 * Duvarlar yalnız İÇERİ bakan yüzle çizilir: kamera duvarın dışına düşünce duvar onu kapatmaz,
 * mekân "kesit" gibi görünmeye devam eder. Bu yüzden kamera arka duvarın ve deniz tarafında
 * cephenin dışına taşabilir (cephe cam). x'te binanın içinde kalır (dışarıda merdiven var).
 */
/*
 * Üst katta arka duvarın en fazla 1 m dışına çıkılır: oradan aşağı bakan ışınlar önce üst kat
 * zeminine çarpar, zemin katın içi görünmez (inceleme). Zeminde kesit kalır; arka duvara bağlı
 * panolar kamera arkalarına geçince gizlenir (`panel-stand`), döşemenin arka bandı dışa bakar.
 */
export const CAMERA_BOUNDS: Record<Level, Bounds> = {
  0: { xMin: -HALF_W + 0.2, xMax: HALF_W - 0.2, zMin: BORDER_Z - 3.5, zMax: BACK_Z + 3 },
  1: { xMin: -HALF_W + 0.2, xMax: HALF_W - 0.2, zMin: FACADE_Z - 3.5, zMax: BACK_Z + 1 },
};

/**
 * **Portrede FOV uyarlanır.** `CAMERA_FOV` DİKEY açıdır; 390×844'te yatay karşılığı ≈ 23°
 * kalır. Yatay açı hedeflenir, dikey en-boy oranından türetilir (bölüm 5.2).
 * Masaüstünde türetilen değer 48'e takılır: masaüstünde hiçbir şey değişmez.
 */
export const FOV_H_TARGET = 46;
export const FOV_MIN = 48;
export const FOV_MAX = 80;

/** En-boy oranına göre dikey FOV (derece). */
export function fovForAspect(aspect: number) {
  const hTarget = (FOV_H_TARGET * Math.PI) / 180;
  const vFov = 2 * Math.atan(Math.tan(hTarget / 2) / aspect);
  const deg = (vFov * 180) / Math.PI;
  return deg < FOV_MIN ? FOV_MIN : deg > FOV_MAX ? FOV_MAX : deg;
}

/** FOV'u kameraya uygular. `three` import etmemek için yapısal tip. */
export function applyAdaptiveFov(
  camera: { isPerspectiveCamera?: boolean; fov: number; updateProjectionMatrix: () => void },
  width: number,
  height: number,
) {
  if (!camera.isPerspectiveCamera || !height) return;
  camera.fov = fovForAspect(width / height);
  camera.updateProjectionMatrix();
}

export const CAM_DIST = 5.4;
export const CAM_HEIGHT = 2.45;
export const CAM_LERP = 0.09;
export const LOOK_AHEAD = 3.0;
export const LOOK_HEIGHT = 1.55;
/** Kamera dönüşü — 180° ≈ 1.2 sn. `1 - pow(BASE, dt)` biçiminde kullanılır. */
export const TURN_BASE = 0.15;
/**
 * Karakter dönüşü kameradan belirgin hızlı. 0.002 ile ayrışma tepe değeri ~74° olur ve
 * `side` görünümü (≥ 67.5°) tetiklenir (bölüm 6.1).
 */
export const CHAR_TURN_BASE = 0.002;

/* --------------------------------- atmosfer -------------------------------- */

/** Gökyüzü kubbesi (BackSide küre). Her yön dolu: `scene.background` hiç görünmez. */
export const SKY_RADIUS = 200;
/** Deniz dairesi kubbenin içinde kalır; kenarı fog ile ufka erir. */
export const SEA_RADIUS = 185;
/**
 * Dağ silueti şeridi: kara tarafı (−x, +z, +x — körfezi çevreleyen tepeler). Kara düzleminin
 * uzak ucundan (160) ÖNDE durur: düzlemin sis rengine dönmüş kenarı dağın eteğinde kalır.
 * Deniz tarafına doğru uçları sıfıra iner.
 */
export const MOUNTAIN_RADIUS = 120;
export const MOUNTAIN_Y = 12;
export const MOUNTAIN_H = 40;
/**
 * Körfezin karşı kıyısı (deniz tarafı, −z): videodaki alçak dağlar ve adalar. Kara şeridinden
 * uzakta (160), sisle soluk; güneşin battığı yerde (−z, hafif −x) alçalır, güneş üstünde kalır.
 */
export const BAY_RADIUS = 160;
export const BAY_Y = 5;
export const BAY_H = 16;

/**
 * Fog rengi = ufuk rengi: deniz kenarı keskin çizgi değil, ufukta erir. Yakın sınır 25: kamera
 * denizden ~4 birim yüksekte, 45'te başlayan sis ufkun yalnız son ~5°'sini boyuyordu.
 */
export const FOG_NEAR = 25;
export const FOG_FAR = 170;

/**
 * Güneş: −z yönünde, hafif −x'e kaymış, ufkun ~3° üstünde. Kubbenin içinde, denizin
 * kenarından önde (170 < 185) — parıltısı ufuk çizgisinin üstüne biner.
 * Parıltı yolu kıyıdan (`SAND_Z_MIN`) başlar.
 */
export const SUN_DIST = 170;
export const SUN_AZIMUTH = -0.27;
export const SUN_ELEVATION_Y = 11;
export const SUN_SIZE = 64;

/**
 * Sahne renkleri — marka rengi DEĞİL, atmosfer/malzeme (karar 2026-10-01: gökyüzü ve deniz
 * burada sahne sabiti olarak kalır, design-tokens'a eklenmez). Marka renkleri
 * (`--color-bg/fg/accent/muted`) runtime'da CSS değişkenlerinden okunur: `lib/zone/brand.ts`.
 */
export const SCENE_COLORS = {
  skyZenith: '#1f1838',
  skyHigh: '#4a2a5a',
  skyMid: '#a24a5c',
  skyLow: '#e8834e',
  horizon: '#f4b26a',
  seaDeep: '#1b3347',
  seaShallow: '#2c5068',
  /**
   * Deniz yüzeyi ışıktan bağımsız çizilir (basic materyal): gün batımında gökyüzünü yansıtan
   * mor-arduvaz. PBR materyalde koyu albedo düşük açılı akşam ışığında siyaha düşüyordu.
   */
  seaSurface: '#463a5c',
  seaRipple: '#7a5e7c',
  sunCore: '#fff4d6',
  sunGlow: '#ffb35c',
  mountain: '#3b2846',
  mountainFar: '#5a3858',
  bay: '#4b3a5e',
  bayFar: '#6b5272',
  land: '#6e5a5c',
  sand: '#c9a77c',
  road: '#b9a58e',
  roadSeam: '#8c7a66',
  /** Videodan: dış teras koyu gri karo, iç mekân açık gri büyük karo. */
  outdoorTile: '#55585d',
  outdoorSeam: '#3d4044',
  indoorTile: '#cfccc6',
  indoorSeam: '#b4b0a9',
  wall: '#f1eee8',
  wallShade: '#dcd7cf',
  ceiling: '#ece9e3',
  /** Reyon: mavi altıgen karo, beyaz metro karo, meşe şerit. */
  hexTile: '#2f7d8e',
  hexTileLight: '#4fa3b2',
  subway: '#f4f2ee',
  oak: '#b07a4a',
  oakSeam: '#7d5432',
  frame: '#25282c',
  steel: '#9a9590',
  /** Pergola lamelleri: ışıktan bağımsız açık gri (alttan koyu düşüp kadrajın üstünü kapatıyordu). */
  slat: '#b6b9be',
  slatDark: '#7f848b',
  bottle: '#3c5a48',
  /** Şarap kavı: koyu kırmızı şişe, folyo kapak; vitrinde buz. */
  wine: '#5a1e2b',
  foil: '#c8a04a',
  ice: '#e6eff0',
  glass: '#9fc4cf',
  /** Masalar: dış/iç açık mavi örtü, üst kat lacivert örtü; altında beyaz örtü. */
  clothAqua: '#8fd0e0',
  clothNavy: '#2c4370',
  clothWhite: '#f3f1ec',
  chairWhite: '#f4f3ef',
  chairBeige: '#e7dccb',
  chairLeg: '#2a2622',
  cushion: '#8fc3d1',
  umbrella: '#f1eee6',
  planter: '#f2f0ea',
  foliage: '#3f6a36',
  foliageLight: '#5f8a45',
  palmTrunk: '#7a5a3c',
  palmLeaf: '#3e6b38',
  stairBlue: '#2f86c9',
  fire: '#ff7a2a',
  bulb: '#ffd28a',
  rope: '#b08a5a',
  lampPole: '#2f3438',
  lampHead: '#ffe2a8',
  beachUmbrella: '#d9b37a',
  flower: '#c2387a',
  skin: '#d6a07a',
  hair: '#2b1d16',
  shadow: '#140c08',
  /** Işıklar — gün batımı sıcak ana ışık + soğuk dolgu. */
  sunLight: '#ffa060',
  fillLight: '#8090c8',
  hemiSky: '#ffd8bd',
  hemiGround: '#3a2440',
} as const;

/* --------------------------------- misafirler --------------------------------- */

/**
 * Kurgusal misafirlerin (NPC) renkleri. Gerçek kişi ya da personel temsil ETMEZ: isim yok,
 * üniforma yok; kahramanın kasketi ve çizgili tişörtü hiçbir misafire verilmez.
 *
 * Sprite atlası renk değil **anahtar** taşır (ten/üst/alt/saç/kontur); gerçek renk shader'da bu
 * paletten örnek başına seçilir — tek atlas, binlerce kombinasyon. Doygunluk ölçülü: kahraman
 * kalabalıkta öne çıksın.
 */
export const NPC_PALETTE = {
  skin: ['#f1c9a5', '#e3ad86', '#c98e65', '#a8714c', '#7d5236', '#5a3a26'],
  /** Saç ve şapka aynı kanal: son ikisi hasır ve beyaz şapka renkleri. */
  hair: ['#1d1512', '#3b2619', '#6b4428', '#a8743f', '#d8b36c', '#9c9893', '#e6e2da', '#d9c08a'],
  top: [
    '#f4f1ea', '#e07a5f', '#7fb3d5', '#9ccfb4', '#e3b23c', '#6d6aa6',
    '#c45a7c', '#5b8c5a', '#d9935f', '#4f7ca8', '#e9c9d3', '#8a6f5c',
  ],
  bottom: ['#3e5a7a', '#c9b48f', '#2b2b2e', '#efece4', '#4a5a3a', '#7a7a80', '#6b4e3a', '#9fb7c9'],
  /** Kumdaki havlular. */
  towel: ['#e07a5f', '#3d8fb3', '#f2c94c', '#7fb3a5', '#c45a7c', '#efe9dc'],
} as const;

/** Sofralardaki tabaklar ve yemekler (masa dekoru — etiketsiz, tıklanmaz). */
export const FOOD_COLORS = {
  plate: '#f6f4ef',
  bowl: '#efe9df',
  clay: '#b4643a',
  basket: '#a9814f',
  water: '#d8ecf2',
  tea: '#9c3a1c',
  fishGrill: '#c48a52',
  fishSilver: '#aeb7bb',
  calamari: '#e2b863',
  bread: '#d8ae73',
  lemon: '#f0d34a',
  salad: '#6f9e45',
  meze: ['#f1ebdc', '#c9472f', '#e6c45c', '#8d6a49', '#a8c486', '#e7d9b7'],
  fruit: ['#f08a24', '#d8433b', '#7fb04a', '#f2c94c', '#8e3d6b'],
  dessert: '#a6683a',
} as const;
