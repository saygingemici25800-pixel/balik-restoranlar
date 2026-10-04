/**
 * Masadaki misafirler ve sofralar — tohumlu kadro (three'siz, saf veri).
 *
 * Kurallar:
 * - Misafirler KURGUSAL: isim/etiket yok, personel yok. Masalar hâlâ yalnız dekor: masa
 *   numarası, kimliği ya da kapasitesi hiçbir yere çizilmez; indeks yalnız tohum içindir.
 * - Her masa farklı: grup tipi, kişi sayısı, oturma düzeni ve yemeğin aşaması (yeni oturmuş →
 *   meze → balık → tatlı/çay) masadan masaya değişir; komşu masalar aynı imzayı almaz.
 * - Kamera koridorları boş: başlangıç kamerasının dibindeki ve panolara giden kamera
 *   yolundaki masalara kimse oturmaz — kamera misafirlerin içinden geçmesin.
 * - Kademe: zayıf cihazda (`low`) aynı kadronun alt kümesi oturur — ekran görüntüleri tutarlı.
 */
import {
  CAM_DIST,
  FOOD_COLORS,
  frameStop,
  LEVEL_Y,
  NPC_PALETTE,
  TABLE_H,
  TABLE_HALF_X,
  TABLE_HALF_Z,
  ZONE_FRAMES,
} from '@/lib/zone/frames';
import { CAM_START_ANG, CHAR_START } from '@/lib/zone/runtime';
import { chairSpots, type ChairSpot, TABLES, type TableStyle } from '@/lib/zone/venue-layout';
import type { NpcLang, NpcPlace, NpcPose } from './lines';
import { SEATED_SILS, type SeatedSil } from './person';
import { hash32, mulberry32, pick, type Rng, weighted } from './rng';

export type CrowdTier = 'off' | 'low' | 'high';

/** Oturan misafir: konum zemin noktası, `face` baktığı yön (0 = +z). */
export type Diner = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly face: number;
  readonly row: number;
  /** Paletteki indeksler: ten, üst, alt, saç/şapka. */
  readonly pal: readonly [number, number, number, number];
  readonly scale: number;
  readonly phase: number;
  /** Çatal döngüsü (sn). Yeni oturmuş masada yemek yok: çok büyük. */
  readonly period: number;
  readonly talk: Talk;
};

/** Konuşma balonunun gördüğü alan (oyuncunun bulunduğu yere göre süzülür). */
export type TalkZone = 'outdoor' | 'indoor' | 'upper' | 'promenade' | 'beach' | 'side' | 'landing';
/**
 * Kendi kendine söylenen satırın seçimi için kişi bilgisi — kimlik değil: isim yok, yalnız
 * alan, yemeğin aşaması, yaş grubu ve dil. `headY` balonun dayandığı yükseklik (dünya).
 */
export type Talk = {
  readonly zone: TalkZone;
  readonly place: NpcPlace;
  readonly stage: Stage | null;
  readonly who: Person['age'];
  readonly pose: NpcPose;
  readonly lang: NpcLang;
  readonly headY: number;
};

/**
 * Turistlerin dili — rastgelelik akışından AYRI bir hash'le (kadronun görünümü değişmesin).
 * Fethiye'nin misafir dağılımına yakın: çoğu İngiliz, sonra Rus, biraz Alman.
 */
export function touristLang(key: string): NpcLang {
  const r = hash32(`lang:${key}`) % 100;
  return r < 55 ? 'en' : r < 85 ? 'ru' : 'de';
}

/** `box` yalnız kumdaki havlular için (`ambient.ts`). */
export type ItemKind = 'cyl' | 'fish' | 'ball' | 'box';
export type TableItem = {
  readonly kind: ItemKind;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly sx: number;
  readonly sy: number;
  readonly sz: number;
  readonly rotY: number;
  readonly color: string;
};

export type Crowd = {
  readonly tier: CrowdTier;
  readonly diners: readonly Diner[];
  readonly items: readonly TableItem[];
  readonly counts: Readonly<Record<TableStyle, { tables: number; diners: number }>>;
};

/* --------------------------------- palet --------------------------------- */

/** Shader'a giden düz palet: ten | saç | üst | alt. İndeksler bu sırayla kaydırılır. */
export const PALETTE: readonly string[] = [
  ...NPC_PALETTE.skin,
  ...NPC_PALETTE.hair,
  ...NPC_PALETTE.top,
  ...NPC_PALETTE.bottom,
];
const OFF = {
  skin: 0,
  hair: NPC_PALETTE.skin.length,
  top: NPC_PALETTE.skin.length + NPC_PALETTE.hair.length,
  bottom: NPC_PALETTE.skin.length + NPC_PALETTE.hair.length + NPC_PALETTE.top.length,
} as const;
const HAIR_YOUNG = [0, 1, 2, 3, 4] as const;
const HAIR_OLD = [5, 6] as const;
const HAT = [6, 7] as const;

/* --------------------------------- kurallar -------------------------------- */

const SEED = hash32('calis-zone-crowd-v1');
/** Oturanın balon dayanağı: baş tepesi (oturan sprite'ta ~1.23 m) + biraz. */
export const SEATED_HEAD = 1.3;

const OCCUPANCY: Record<TableStyle, number> = { outdoor: 0.7, indoor: 0.5, upper: 0.55 };
const LOW_TIER_SHARE = 0.6;

type Group = 'coupleFace' | 'coupleView' | 'friends' | 'family' | 'elders' | 'tourists' | 'solo';
const GROUP_WEIGHTS: Record<TableStyle, readonly (readonly [Group, number])[]> = {
  outdoor: [['coupleView', 20], ['coupleFace', 15], ['friends', 25], ['family', 20], ['elders', 10], ['tourists', 7], ['solo', 3]],
  indoor: [['family', 30], ['friends', 25], ['elders', 20], ['coupleFace', 15], ['solo', 10]],
  upper: [['coupleView', 15], ['coupleFace', 15], ['friends', 30], ['tourists', 15], ['family', 15], ['elders', 10]],
};

/** Grubun turist olma olasılığı (%): dil seçimi için — görünümü değiştirmez. */
const FOREIGN_SHARE: Record<Group, number> = {
  tourists: 100,
  coupleView: 40,
  coupleFace: 25,
  friends: 25,
  family: 15,
  elders: 10,
  solo: 10,
};

/** Yemeğin aşaması: masada ne olduğunu ve çatal sıklığını belirler (`lines.ts` satırları buna eşlenir). */
export type Stage = 'yeni' | 'meze' | 'balik' | 'tatli';
const STAGES: readonly (readonly [Stage, number])[] = [['yeni', 15], ['meze', 35], ['balik', 35], ['tatli', 15]];
/** Çatal döngüsü aralığı (sn); `yeni`de yemek yok. */
const PERIOD: Record<Stage, readonly [number, number]> = {
  yeni: [1e6, 1e6],
  meze: [6, 9],
  balik: [4, 7],
  tatli: [8, 11],
};

/** Başlangıç kamerası (zone-canvas START_CAM ile aynı formül) — dibindeki masalar boş. */
const START_CAM = {
  x: CHAR_START.x - Math.sin(CAM_START_ANG) * CAM_DIST,
  z: CHAR_START.z - Math.cos(CAM_START_ANG) * CAM_DIST,
};
const START_CLEAR = 2.0;
/** Pano kamera koridoru: durma noktasından normal boyunca geriye, yarı genişlik. */
const CORRIDOR_LEN = CAM_DIST + 1;
const CORRIDOR_HALF = 1.0;

function blocked(t: (typeof TABLES)[number]): boolean {
  if (t.level === CHAR_START.level && Math.hypot(t.x - START_CAM.x, t.z - START_CAM.z) < START_CLEAR) return true;
  for (const f of ZONE_FRAMES) {
    if (f.level !== t.level) continue;
    const [sx, , sz] = frameStop(f);
    // normal eksen hizalı: koridor bir dikdörtgen
    const ex = sx + f.nx * CORRIDOR_LEN;
    const ez = sz + f.nz * CORRIDOR_LEN;
    const xMin = Math.min(sx, ex) - (f.nx === 0 ? CORRIDOR_HALF : 0);
    const xMax = Math.max(sx, ex) + (f.nx === 0 ? CORRIDOR_HALF : 0);
    const zMin = Math.min(sz, ez) - (f.nz === 0 ? CORRIDOR_HALF : 0);
    const zMax = Math.max(sz, ez) + (f.nz === 0 ? CORRIDOR_HALF : 0);
    if (t.x + TABLE_HALF_X > xMin && t.x - TABLE_HALF_X < xMax && t.z + TABLE_HALF_Z > zMin && t.z - TABLE_HALF_Z < zMax) {
      return true;
    }
  }
  return false;
}

/* --------------------------------- seçimler -------------------------------- */

export type Person = { sil: SeatedSil; age: 'adult' | 'elder' | 'kid' };

/**
 * Kişinin paleti (ten, üst, alt, saç/şapka indeksleri). Aynı gruptakiler aynı üstü giymez
 * (`usedTops`); şapka yalnız hasır/beyaz, yaşlının saçı gri/beyaz.
 */
export function paletteFor(
  rng: Rng,
  person: Person,
  usedTops?: Set<number>,
  /** Saç çekilişinden hemen sonra: masadakilerin yön çekilişi buradaydı (Faz 1 kadrosu aynı kalsın). */
  afterHair?: () => void,
): Diner['pal'] {
  let topIdx = Math.floor(rng() * NPC_PALETTE.top.length);
  for (let g = 0; g < 6 && usedTops?.has(topIdx); g++) topIdx = (topIdx + 5) % NPC_PALETTE.top.length;
  usedTops?.add(topIdx);
  const hair =
    person.sil === 'sunhat' ? pick(rng, HAT) : person.age === 'elder' ? pick(rng, HAIR_OLD) : pick(rng, HAIR_YOUNG);
  afterHair?.();
  return [
    OFF.skin + Math.floor(rng() * NPC_PALETTE.skin.length),
    OFF.top + topIdx,
    OFF.bottom + Math.floor(rng() * NPC_PALETTE.bottom.length),
    OFF.hair + hair,
  ];
}

function sizeFor(rng: Rng, g: Group): number {
  switch (g) {
    case 'coupleFace':
    case 'coupleView':
      return 2;
    case 'solo':
      return 1;
    case 'family':
      return rng() < 0.5 ? 3 : 4;
    case 'elders':
      return rng() < 0.6 ? 2 : 4;
    default:
      return rng() < 0.45 ? 3 : 4;
  }
}

function peopleFor(rng: Rng, g: Group, n: number): Person[] {
  const adult = (): Person => ({
    sil: weighted<SeatedSil>(rng, g === 'tourists'
      ? [['sunhat', 45], ['short', 25], ['long', 20], ['bun', 10]]
      : [['short', 40], ['long', 35], ['bun', 15], ['sunhat', 10]]),
    age: 'adult',
  });
  const elder = (): Person => ({ sil: rng() < 0.7 ? 'elder' : 'bun', age: 'elder' });
  const kid = (): Person => ({ sil: rng() < 0.5 ? 'short' : 'long', age: 'kid' });
  return Array.from({ length: n }, (_, i) => {
    if (g === 'elders') return elder();
    if (g === 'family') return i < 2 ? adult() : kid();
    return adult();
  });
}

/** Hangi sandalyeler dolu (`chairSpots` sırası: [deniz−,deniz+,iç−,iç+]). */
function seatsFor(rng: Rng, g: Group, n: number, chairs: readonly ChairSpot[]): ChairSpot[] {
  const at = (i: number) => chairs[i] as ChairSpot;
  if (n === 4) return [...chairs];
  if (g === 'coupleView') {
    // ikisi de iç tarafta, denize karşı yan yana
    return [at(2), at(3)];
  }
  if (n === 2) {
    const sx = rng() < 0.5 ? 0 : 1;
    return [at(sx), at(2 + sx)];
  }
  if (n === 1) return [rng() < 0.75 ? at(2 + (rng() < 0.5 ? 0 : 1)) : at(rng() < 0.5 ? 0 : 1)];
  const skip = Math.floor(rng() * 4);
  return chairs.filter((_, i) => i !== skip);
}

/* ---------------------------------- sofra ---------------------------------- */

function settingFor(
  rng: Rng,
  stage: Stage,
  t: { x: number; z: number },
  y: number,
  seats: readonly ChairSpot[],
): TableItem[] {
  const top = y + TABLE_H;
  const out: TableItem[] = [];
  const cyl = (x: number, z: number, r: number, h: number, color: string, lift = 0) =>
    out.push({ kind: 'cyl', x, y: top + lift + h / 2, z, sx: r, sy: h, sz: r, rotY: 0, color });
  const ball = (x: number, z: number, r: number, color: string, lift = 0, squash = 1) =>
    out.push({ kind: 'ball', x, y: top + lift + r * squash, z, sx: r, sy: r * squash, sz: r, rotY: 0, color });
  const bowl = (x: number, z: number, r: number, content: string) => {
    cyl(x, z, r, 0.035, FOOD_COLORS.bowl);
    cyl(x, z, r * 0.85, 0.008, content, 0.035);
  };

  for (const c of seats) {
    const px = c.x;
    const pz = t.z + c.side * 0.2;
    cyl(px, pz, 0.105, 0.012, FOOD_COLORS.plate);
    const gx = c.x + c.sx * 0.15;
    const gz = t.z + c.side * 0.3;
    if (stage === 'tatli') cyl(gx, gz, 0.022, 0.07, FOOD_COLORS.tea);
    else cyl(gx, gz, 0.027, 0.1, FOOD_COLORS.water);

    if (stage === 'meze') cyl(px, pz, 0.05, 0.01, pick(rng, FOOD_COLORS.meze), 0.012);
    if (stage === 'balik') {
      if (rng() < 0.7) {
        out.push({
          kind: 'fish',
          x: px,
          y: top + 0.034,
          z: pz,
          sx: 1,
          sy: 1,
          sz: 1,
          rotY: (rng() - 0.5) * 0.8 + (rng() < 0.5 ? 0 : Math.PI),
          color: rng() < 0.6 ? FOOD_COLORS.fishGrill : FOOD_COLORS.fishSilver,
        });
      } else {
        for (let k = 0; k < 3; k++) ball(px + (k - 1) * 0.04, pz + (rng() - 0.5) * 0.04, 0.022, FOOD_COLORS.calamari, 0.012, 0.5);
      }
      ball(px + 0.07, pz - c.side * 0.04, 0.016, FOOD_COLORS.lemon, 0.012, 0.7);
    }
    if (stage === 'tatli' && rng() < 0.6) cyl(px, pz, 0.045, 0.025, FOOD_COLORS.dessert, 0.012);
  }

  // ortadaki servis: 4 yuva, eksen boyunca
  // şemsiyeli masada direk ortadan geçer (r 0.05): yuvalar ondan açıkta
  const slots = [-0.3, -0.14, 0.14, 0.3].map((dx) => ({ x: t.x + dx, z: t.z + (rng() - 0.5) * 0.04 }));
  const slot = (i: number) => slots[i] as { x: number; z: number };
  const basket = (s: { x: number; z: number }) => {
    cyl(s.x, s.z, 0.075, 0.045, FOOD_COLORS.basket);
    for (let k = 0; k < 3; k++) ball(s.x + (k - 1) * 0.035, s.z + (rng() - 0.5) * 0.03, 0.03, FOOD_COLORS.bread, 0.035, 0.8);
  };
  if (stage === 'yeni') {
    basket(slot(1));
  } else if (stage === 'meze') {
    const n = seats.length >= 3 ? 4 : 3;
    const start = n === 4 ? 0 : 1;
    for (let i = 0; i < n; i++) bowl(slot(start + i).x, slot(start + i).z, 0.055, pick(rng, FOOD_COLORS.meze));
  } else if (stage === 'balik') {
    bowl(slot(1).x, slot(1).z, 0.08, FOOD_COLORS.salad);
    bowl(slot(2).x, slot(2).z, 0.055, pick(rng, FOOD_COLORS.meze));
    if (seats.length >= 3) basket(slot(3));
  } else {
    // meyve tabağı direkten (r 0.05) açıkta: merkezi 0.17, yarıçapı 0.085
    const s = slot(rng() < 0.5 ? 1 : 2);
    const fx = t.x + Math.sign(s.x - t.x) * 0.17;
    cyl(fx, s.z, 0.085, 0.012, FOOD_COLORS.plate);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ball(fx + Math.cos(a) * 0.045, s.z + Math.sin(a) * 0.035, 0.024, pick(rng, FOOD_COLORS.fruit), 0.012);
    }
  }
  return out;
}

/* --------------------------------- kadro ---------------------------------- */

export function buildCrowd(tier: CrowdTier): Crowd {
  const counts: Record<TableStyle, { tables: number; diners: number }> = {
    outdoor: { tables: 0, diners: 0 },
    indoor: { tables: 0, diners: 0 },
    upper: { tables: 0, diners: 0 },
  };
  const diners: Diner[] = [];
  const items: TableItem[] = [];
  if (tier === 'off') return { tier, diners, items, counts };

  // 1) Doluluk KOTA ile: her masanın ilk çekilişi sıralanır, alan başına ilk %occ dolu. Yazı-tura
  //    olsaydı tohuma göre %55 hedef %83 çıkabiliyordu. Düşük kademe aynı sıranın ilk %60'ı —
  //    yüksek kademenin kesin alt kümesi.
  const cand = TABLES.flatMap((t, i) => {
    if (blocked(t)) return [];
    const rng = mulberry32(SEED ^ hash32(`t${i}`));
    return [{ t, i, rng, p: rng() }];
  });
  const high = new Set<number>();
  const low = new Set<number>();
  for (const style of ['outdoor', 'indoor', 'upper'] as const) {
    const list = cand.filter((c) => c.t.style === style).sort((a, b) => a.p - b.p);
    const nHigh = Math.round(OCCUPANCY[style] * list.length);
    list.slice(0, nHigh).forEach((c) => high.add(c.i));
    list.slice(0, Math.round(LOW_TIER_SHARE * nHigh)).forEach((c) => low.add(c.i));
  }

  // 2) Seçim her iki kademede aynı (yüksek kademenin dolu masaları üzerinden), kademe filtresi
  //    SONRA: iki kademede aynı masada aynı insanlar oturur. "Her masa farklı": aynı kattaki
  //    komşu masalarla (aynı sırada ya da aynı sütunda yakın) aynı imza çıkarsa yeniden çekilir.
  const assigned: { t: (typeof TABLES)[number]; sig: string }[] = [];
  const isNeighbour = (a: (typeof TABLES)[number], b: (typeof TABLES)[number]) =>
    a.level === b.level &&
    ((Math.abs(a.z - b.z) < 0.01 && Math.abs(a.x - b.x) <= 4) || (Math.abs(a.x - b.x) < 0.01 && Math.abs(a.z - b.z) <= 3.3));

  for (const { t, i, rng } of cand) {
    if (!high.has(i)) continue;
    let group: Group = 'solo';
    let n = 1;
    let stage: Stage = 'meze';
    let seats: ChairSpot[] = [];
    let sig = '';
    const chairs = chairSpots(t);
    for (let attempt = 0; attempt < 5; attempt++) {
      group = weighted(rng, GROUP_WEIGHTS[t.style]);
      n = sizeFor(rng, group);
      stage = weighted(rng, STAGES);
      seats = seatsFor(rng, group, n, chairs);
      sig = `${group}|${n}|${stage}|${seats.map((c) => `${c.side}${c.sx}`).join('')}`;
      if (!assigned.some((a) => a.sig === sig && isNeighbour(a.t, t))) break;
    }
    assigned.push({ t, sig });
    if (tier === 'low' && !low.has(i)) continue;

    const y = LEVEL_Y[t.level];
    const people = peopleFor(rng, group, n);
    // turist masaları kendi dilinde; diğer grupların da bir kısmı turist (Çalış'ın misafir profili)
    const foreign = hash32(`tour:${i}`) % 100 < FOREIGN_SHARE[group];
    const lang: NpcLang = foreign ? touristLang(`t${i}`) : 'tr';
    const usedTops = new Set<number>();
    seats.forEach((c, k) => {
      const person = people[k] ?? { sil: 'short' as const, age: 'adult' as const };
      let face = 0;
      const pal = paletteFor(rng, person, usedTops, () => {
        face = (c.side === -1 ? 0 : Math.PI) + (rng() - 0.5) * 0.5;
      });
      const kid = person.age === 'kid';
      const [pMin, pMax] = PERIOD[stage];
      // çocuk yükseltici minderde: başı masanın üstünde kalsın
      const dy = y + (kid ? 0.17 : 0);
      const scale = kid ? 0.7 : 0.95 + rng() * 0.1;
      diners.push({
        x: c.x,
        y: dy,
        z: c.z,
        face,
        row: SEATED_SILS.indexOf(person.sil),
        pal,
        scale,
        phase: rng(),
        period: pMin + rng() * (pMax - pMin),
        talk: { zone: t.style, place: 'table', stage, who: person.age, pose: 'sit', lang, headY: dy + SEATED_HEAD * scale },
      });
    });
    items.push(...settingFor(rng, stage, t, y, seats));
    counts[t.style].tables += 1;
    counts[t.style].diners += seats.length;
  }
  return { tier, diners, items, counts };
}

/**
 * Cihaza göre kademe. `?npc=off|low|high` her ortamda elle seçer (A/B ölçümü). Zayıf cihaz:
 * ≤ 4 çekirdek, ≤ 4 GB bellek ya da küçük dokunmatik ekran.
 */
export function pickCrowdTier(): CrowdTier {
  if (typeof window === 'undefined') return 'high';
  const forced = new URLSearchParams(window.location.search).get('npc');
  if (forced === 'off' || forced === 'low' || forced === 'high') return forced;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weakCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const weakMem = (nav.deviceMemory ?? 8) <= 4;
  const smallTouch = window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 500;
  return weakCpu || weakMem || smallTouch ? 'low' : 'high';
}
