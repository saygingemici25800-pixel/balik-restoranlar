/**
 * Sahil yolu, kumsal ve yan alanlardaki kurgusal insanlar — yerleşim + yürüme (three'siz).
 *
 * - Sahil yolu: iki şeritte zıt yönlere yürüyenler (çiftler yan yana, bir koşucu, aileler);
 *   denize bakan kenarda gün batımını izleyen ve fotoğrafını çekenler.
 * - Kumsal: şemsiye altında havluda oturanlar, kıyıda duranlar, su kenarında yürüyenler, koşturan
 *   bir çocuk.
 * - Yanlar: terasın −x yanında ayaküstü sohbet eden iki kişi ve gidip gelen biri, +x yanında
 *   denize bakan biri, dış merdivenin sahanlığında manzarayı izleyen biri.
 *
 * Oyuncunun yürüyebildiği alanın (`WALK_BOUNDS`) dışında kalırlar: çarpışma ya da yol verme
 * gerekmez. Şeritte yürüyenler yolun uçlarında (±`WRAP`) solup öbür uçtan girer. Düşük kademede
 * yalnız `core` gruplar — aynı kişiler, aynı yerlerde.
 */
import { LEVEL_Y, NPC_PALETTE, ROAD_Z_MIN, SAND_Y, STAIR } from '@/lib/zone/frames';
import { BEACH_UMBRELLAS } from '@/lib/zone/venue-layout';
import { type Sil, SILS } from './pen';
import { hash32, mulberry32, pick, type Rng, weighted } from './rng';
import type { NpcLang } from './lines';
import { type CrowdTier, type Diner, type Person, paletteFor, SEATED_HEAD, type TableItem, type Talk, touristLang } from './roster';

/** 0 yürür · 1 durur · 2 telefonla fotoğraf çeker (shader `aMode`). */
export type Mode = 0 | 1 | 2;
export type Area = 'promenade' | 'beach' | 'side';

type Path =
  /** x boyunca sabit yönde; ±WRAP'te öbür uca geçer. */
  | { readonly kind: 'lane'; readonly speed: number }
  /** Bir eksende iki uç arasında gidip gelir, uçta bekler. */
  | { readonly kind: 'pace'; readonly axis: 'x' | 'z'; readonly min: number; readonly max: number; readonly speed: number; readonly wait: number };

export type Stroller = {
  x: number;
  z: number;
  face: number;
  vis: number;
  mode: Mode;
  dir: 1 | -1;
  waitLeft: number;
  readonly y: number;
  readonly row: number;
  readonly pal: Diner['pal'];
  readonly scale: number;
  readonly phase: number;
  /** Saniyedeki adım çifti (shader yürüyüş karesi). */
  readonly rate: number;
  readonly path: Path | null;
  readonly area: Area;
  readonly talk: Talk;
};

/** Ayakta duranın balon dayanağı: baş tepesi (~1.68 m) + biraz. */
const STANDING_HEAD = 1.78;

export type Ambient = {
  readonly strollers: readonly Stroller[];
  readonly sitters: readonly Diner[];
  readonly towels: readonly TableItem[];
  readonly counts: Readonly<Record<Area | 'sitters', number>>;
};

/**
 * Şeritte yürüyenlerin dönüş sınırı. Sis 46 m'de henüz hafif (~%14): yol boyunca bakan kamera
 * ucu görebilir — bu yüzden son `FADE` metrede kişi de gölgesi de solar, öbür uçtan solarak girer.
 */
export const WRAP = 46;
const FADE = 4;

const LANE_SEA = -17.0;
const LANE_LAND = -15.2;
/**
 * Aynı alt şeritteki herkes AYNI hızda: kaçınma yok, farklı hız birbirinin içinden geçirirdi.
 * Farklı hızdakiler (yaşlı, koşucu) en az 0.6 m ayrı alt şeritte.
 */
const LANE_SPEED = 1.05;
/** Yolun denize bakan kenarı (lambaların z −18.4 hattının ötesi). */
const RAIL_Z = ROAD_Z_MIN + 0.3;
const SHORE_STAND_Z = -28.8;
const SHORE_WALK_Z = -30.4;
const LAND_Y = -0.03;
/** Havluda oturan: oturan sprite'ta kalça 0.47; kalça kumun 6 cm üstünde. */
const SIT_Y = SAND_Y + 0.06 - 0.47;

const faceOf = (dx: number, dz: number) => Math.atan2(dx, dz);
const SEA = Math.PI;

/* ---------------------------------- yerleşim ---------------------------------- */

type Member = {
  readonly x: number;
  readonly z: number;
  readonly y: number;
  readonly age: Person['age'];
  readonly sil?: Sil;
  readonly face?: number;
  readonly mode?: Mode;
  readonly dir?: 1 | -1;
  readonly path?: Path;
};
/** `tourist`: güneş şapkası ağırlıklı + yabancı dil; `foreign`: yalnız yabancı dil (görünüm aynı). */
type Group = {
  readonly area: Area;
  readonly core: boolean;
  readonly tourist?: boolean;
  readonly foreign?: boolean;
  readonly members: readonly Member[];
};

const lane = (speed: number): Path => ({ kind: 'lane', speed });
/** Şeritte yürüyen: deniz şeridi −x yönüne, kara şeridi +x yönüne. */
const walker = (x: number, z: number, speed: number, age: Person['age'] = 'adult', sil?: Sil): Member => ({
  x,
  z,
  y: z < -19 ? SAND_Y : 0,
  age,
  sil,
  dir: z < -16 ? -1 : 1,
  mode: 0,
  path: lane(speed),
});
const stander = (x: number, z: number, y: number, face: number, mode: Mode = 1, age: Person['age'] = 'adult', sil?: Sil): Member => ({
  x,
  z,
  y,
  age,
  sil,
  face,
  mode,
});

const GROUPS: readonly Group[] = [
  /* ---- sahil yolu: yürüyenler ---- */
  { area: 'promenade', core: true, foreign: true, members: [walker(-30, LANE_LAND, LANE_SPEED), walker(-29.85, LANE_LAND + 0.55, LANE_SPEED)] },
  { area: 'promenade', core: true, members: [walker(12, LANE_SEA, LANE_SPEED), walker(12.15, LANE_SEA + 0.5, LANE_SPEED, 'kid')] },
  // yaşlı yavaş yürür: kendi alt şeridinde (kimseyle aynı z'de değil)
  { area: 'promenade', core: true, members: [walker(8, LANE_LAND - 0.7, 0.75, 'elder')] },
  { area: 'promenade', core: false, foreign: true, members: [walker(-14, LANE_SEA, LANE_SPEED), walker(-13.85, LANE_SEA + 0.55, LANE_SPEED)] },
  // koşucu: yolun kara kenarında kendi alt şeridi
  { area: 'promenade', core: true, members: [walker(30, LANE_LAND + 1.2, 2.7, 'adult', 'short')] },
  { area: 'promenade', core: false, foreign: true, members: [walker(36, LANE_SEA, LANE_SPEED)] },
  { area: 'promenade', core: true, tourist: true, members: [walker(-4, LANE_LAND, LANE_SPEED), walker(-3.85, LANE_LAND + 0.55, LANE_SPEED)] },
  { area: 'promenade', core: false, members: [walker(-38, LANE_SEA, LANE_SPEED)] },
  /* ---- sahil yolu: denize bakıp duranlar ---- */
  { area: 'promenade', core: true, members: [stander(4.6, RAIL_Z, 0, SEA, 2)] },
  { area: 'promenade', core: true, members: [stander(-5.0, RAIL_Z, 0, SEA + 0.1), stander(-4.45, RAIL_Z, 0, SEA - 0.1)] },
  { area: 'promenade', core: false, members: [stander(11.3, RAIL_Z, 0, SEA, 1, 'elder')] },
  { area: 'promenade', core: false, tourist: true, members: [stander(-13.4, RAIL_Z, 0, SEA, 2)] },
  { area: 'promenade', core: false, members: [stander(19.4, RAIL_Z, 0, SEA), stander(19.95, RAIL_Z, 0, SEA, 1, 'kid')] },
  /* ---- kumsal: kıyıda duranlar, su kenarında yürüyenler, koşturan çocuk ---- */
  { area: 'beach', core: true, foreign: true, members: [stander(-6.2, SHORE_STAND_Z, SAND_Y, SEA), stander(-5.65, SHORE_STAND_Z, SAND_Y, SEA)] },
  { area: 'beach', core: true, tourist: true, members: [stander(7.6, SHORE_STAND_Z, SAND_Y, SEA, 2)] },
  { area: 'beach', core: false, members: [stander(-17, SHORE_STAND_Z, SAND_Y, SEA, 1, 'elder')] },
  { area: 'beach', core: false, members: [{ ...walker(-20, SHORE_WALK_Z + 0.3, 0.85), dir: 1 }, { ...walker(-19.85, SHORE_WALK_Z + 0.8, 0.85), dir: 1 }] },
  { area: 'beach', core: true, members: [{ ...walker(25, SHORE_WALK_Z - 0.25, 1.0), dir: -1 }] },
  {
    area: 'beach',
    core: true,
    members: [
      {
        x: 2.4,
        z: -27.6,
        y: SAND_Y,
        age: 'kid',
        mode: 0,
        dir: 1,
        path: { kind: 'pace', axis: 'x', min: 0.8, max: 4.0, speed: 1.6, wait: 0.8 },
      },
    ],
  },
  /* ---- yanlar ---- */
  // İletişim panosunun (x −14.88, z −8) arkasına düşmesinler: sahil yoluna yakın
  { area: 'side', core: true, members: [stander(-17.6, -11.6, LAND_Y, Math.PI / 2), stander(-16.95, -11.4, LAND_Y, -Math.PI / 2)] },
  {
    area: 'side',
    core: false,
    members: [
      { x: -19.6, z: -8, y: LAND_Y, age: 'adult', mode: 0, dir: 1, path: { kind: 'pace', axis: 'z', min: -12.8, max: -4.5, speed: 0.9, wait: 2.5 } },
    ],
  },
  { area: 'side', core: true, members: [stander(17.8, -10.2, LAND_Y, SEA, 1, 'elder')] },
  // dış merdivenin sahanlığı (üst kat hizası): dış korkuluğun dibinde, açık uçtan geride
  { area: 'side', core: true, members: [stander(STAIR.xMax - 0.3, -1.3, LEVEL_Y[1], SEA)] },
];

/** Şemsiye altında havluda oturanlar: şemsiye indeksi → kişi sayısı. */
const SITTERS: readonly {
  readonly umbrella: number;
  readonly n: 1 | 2;
  readonly core: boolean;
  readonly tourist?: boolean;
  readonly foreign?: boolean;
}[] = [
  { umbrella: 2, n: 2, core: true },
  { umbrella: 3, n: 1, core: true },
  { umbrella: 5, n: 2, core: true, tourist: true },
  { umbrella: 6, n: 1, core: false },
  { umbrella: 8, n: 2, core: false, foreign: true },
  { umbrella: 9, n: 1, core: true },
];

/* ---------------------------------- kurulum ---------------------------------- */

const SEED = hash32('calis-zone-ambient-v1');

function silFor(rng: Rng, m: Pick<Member, 'age' | 'sil'>, tourist: boolean): Sil {
  if (m.sil) return m.sil;
  if (m.age === 'elder') return rng() < 0.7 ? 'elder' : 'bun';
  if (m.age === 'kid') return rng() < 0.5 ? 'short' : 'long';
  return weighted<Sil>(
    rng,
    tourist ? [['sunhat', 45], ['short', 25], ['long', 20], ['bun', 10]] : [['short', 40], ['long', 35], ['bun', 15], ['sunhat', 10]],
  );
}

export function buildAmbient(tier: CrowdTier): Ambient {
  const strollers: Stroller[] = [];
  const sitters: Diner[] = [];
  const towels: TableItem[] = [];
  const counts = { promenade: 0, beach: 0, side: 0, sitters: 0 };
  if (tier === 'off') return { strollers, sitters, towels, counts };

  GROUPS.forEach((g, gi) => {
    if (tier === 'low' && !g.core) return;
    const rng = mulberry32(SEED ^ hash32(`g${gi}`));
    const usedTops = new Set<number>();
    const lang: NpcLang = g.tourist || g.foreign ? touristLang(`g${gi}`) : 'tr';
    for (const m of g.members) {
      const sil = silFor(rng, m, !!g.tourist);
      const speed = m.path?.speed ?? 0;
      const dir = m.dir ?? 1;
      const kid = m.age === 'kid';
      // çekiliş sırası Faz 2 ile aynı: palet → ölçek → faz (kadronun görünümü değişmesin)
      const pal = paletteFor(rng, { sil, age: m.age }, usedTops);
      const scale = kid ? 0.62 : 0.95 + rng() * 0.1;
      const landing = g.area === 'side' && m.y >= LEVEL_Y[1] - 0.1;
      strollers.push({
        x: m.x,
        z: m.z,
        y: m.y,
        face: m.face ?? (m.path?.kind === 'pace' && m.path.axis === 'z' ? faceOf(0, dir) : faceOf(dir, 0)),
        vis: 1,
        mode: m.mode ?? 1,
        dir,
        waitLeft: 0,
        row: SILS.indexOf(sil),
        pal,
        scale,
        phase: rng(),
        // adım çifti ~1.4 m (çocukta ölçekle kısalır: daha sık adım)
        rate: speed > 0 ? speed / (1.4 * (kid ? 0.62 : 1)) : 0,
        path: m.path ?? null,
        area: g.area,
        talk: {
          zone: landing ? 'landing' : g.area,
          place: g.area,
          stage: null,
          who: m.age,
          pose: m.path ? 'walk' : 'stand',
          lang,
          headY: m.y + STANDING_HEAD * scale,
        },
      });
      counts[g.area] += 1;
    }
  });

  SITTERS.forEach((spec, si) => {
    if (tier === 'low' && !spec.core) return;
    const u = BEACH_UMBRELLAS[spec.umbrella];
    if (!u) return;
    const rng = mulberry32(SEED ^ hash32(`s${si}`));
    const usedTops = new Set<number>();
    const lang: NpcLang = spec.tourist || spec.foreign ? touristLang(`s${si}`) : 'tr';
    const offsets = spec.n === 2 ? [-0.45, 0.45] : [rng() < 0.5 ? -0.4 : 0.4];
    for (const dx of offsets) {
      const sil = silFor(rng, { age: rng() < 0.2 ? 'elder' : 'adult' }, !!spec.tourist);
      const x = u.x + dx;
      const z = u.z + 0.25;
      const elder = sil === 'elder';
      // çekiliş sırası Faz 2 ile aynı: yön → palet → ölçek → faz
      const face = SEA + (rng() - 0.5) * 0.4;
      const pal = paletteFor(rng, { sil, age: elder ? 'elder' : 'adult' }, usedTops);
      const scale = 0.95 + rng() * 0.1;
      sitters.push({
        x,
        y: SIT_Y,
        z,
        face,
        row: SILS.indexOf(sil),
        pal,
        scale,
        phase: rng(),
        // kumda yemek yok: çatal hiç kalkmaz
        period: 1e6,
        talk: {
          zone: 'beach',
          place: 'beach',
          stage: null,
          who: elder ? 'elder' : 'adult',
          pose: 'sit',
          lang,
          headY: SIT_Y + SEATED_HEAD * scale,
        },
      });
      // havlu: oturanın önüne (denize doğru) uzanır
      towels.push({
        kind: 'box',
        x,
        y: SAND_Y + 0.006,
        z: z - 0.45,
        sx: 0.7,
        sy: 0.012,
        sz: 1.55,
        rotY: (rng() - 0.5) * 0.15,
        color: pick(rng, NPC_PALETTE.towel),
      });
      counts.sitters += 1;
    }
  });

  return { strollers, sitters, towels, counts };
}

/* ---------------------------------- yürüme ---------------------------------- */

/**
 * Bir simülasyon adımı (yerinde günceller, kare başına allocation yok). Şeritte yürüyen ±WRAP'te
 * öbür uca geçer, uçlara yaklaşırken `vis` ile solar; gidip gelen uçta `wait` sn durur.
 */
export function stepAmbient(list: readonly Stroller[], dt: number) {
  for (const s of list) {
    const p = s.path;
    if (!p) continue;
    if (p.kind === 'lane') {
      s.x += s.dir * p.speed * dt;
      if (s.x > WRAP) s.x -= 2 * WRAP;
      else if (s.x < -WRAP) s.x += 2 * WRAP;
      s.vis = Math.min(1, Math.max(0, (WRAP - Math.abs(s.x)) / FADE));
      continue;
    }
    if (s.waitLeft > 0) {
      s.waitLeft -= dt;
      s.mode = s.waitLeft > 0 ? 1 : 0;
      continue;
    }
    const cur = p.axis === 'x' ? s.x : s.z;
    let next = cur + s.dir * p.speed * dt;
    if (next >= p.max || next <= p.min) {
      next = Math.min(p.max, Math.max(p.min, next));
      s.dir = s.dir === 1 ? -1 : 1;
      s.waitLeft = p.wait;
      s.mode = 1;
    }
    if (p.axis === 'x') s.x = next;
    else s.z = next;
    s.face = p.axis === 'x' ? faceOf(s.dir, 0) : faceOf(0, s.dir);
  }
}
