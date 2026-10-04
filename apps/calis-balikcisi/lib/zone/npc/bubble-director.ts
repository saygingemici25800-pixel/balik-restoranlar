import * as THREE from 'three';

import type { BrandPalette } from '@/lib/zone/brand';
import { type BubbleLayout, layoutBubble, TEXT_W } from './bubble';
import { lineDuration, pickLine, visibleZones } from './chatter';
import { mulberry32, type Rng } from './rng';
import type { Talk } from './roster';

/**
 * Balon yönetmeni: kim, ne zaman, ne söyler — ve balon ekranda NEREDE durabilir. Kurallar
 * ekran pikseliyle uygulanır (balonun gerçek ölçülmüş kutusu):
 * - aynı anda en fazla N balon (güçlü cihaz 3, zayıf 2); konuşan 28 sn susar;
 * - yalnız oyuncunun bulunduğu yerden görülen alandakiler (`visibleZones`); oturan ≥ 3 m,
 *   ayaktaki ≥ 4.5 m (yakındakiler zaten soluk), ≤ 24 m;
 * - balon ekranın içinde; başlık, Çık/Konuşmalar ve joystick bölgesine, kahramana ve diğer
 *   balonlara binmez; kamera ile kahraman arasındaki (soluk) misafir konuşmaz;
 * - bu kurallar her karede yeniden denetlenir: bozulan balon söner;
 * - pano/merdiven halkasında yeni balon yok (prompt öne çıksın).
 */

export type Speaker = {
  readonly talk: Talk;
  /** Canlı konum: masadaki için sabit, yürüyen için her kare değişen nesne. */
  readonly ref: { readonly x: number; readonly z: number; readonly vis?: number };
};

type Box = { x0: number; y0: number; x1: number; y1: number };

export type Slot = {
  speaker: number;
  layout: BubbleLayout;
  lang: string;
  start: number;
  end: number;
  /** Yazı dokuya henüz çizilmedi. */
  dirty: boolean;
  box: Box;
};

/** Ekran ölçüsü (CSS px), kanvas pikselinin ekran karşılığı `k`, sarma genişliği. */
export type BubbleView = { w: number; h: number; k: number; textW: number };

export function bubbleView(w: number, h: number): BubbleView {
  return {
    w,
    h,
    // yazı masaüstünde ~18 px, telefonda ~16 px
    k: Math.min(0.62, Math.max(0.45, Math.min(w, h) / 700)),
    textW: w < 600 ? TEXT_W.narrow : TEXT_W.wide,
  };
}

export type Director = {
  t: number;
  next: number;
  slots: (Slot | null)[];
  until: Float64Array;
  recent: string[];
  rng: Rng;
  fast: boolean;
  measure: CanvasRenderingContext2D | null;
};

export const FADE_IN = 0.15;
export const FADE_OUT = 0.2;
const MIN_D_SIT = 3;
const MIN_D_STAND = 4.5;
const MAX_D = 24;
const HERO_H = 1.66;
const HERO_HALF_W = 0.45;
const MARGIN = 6;

const tmp = new THREE.Vector3();
const tmpView = new THREE.Vector3();

export function createDirector(speakers: number, slots: number): Director {
  // QA: `?chat=fast` sık konuşturur — yalnız geliştirmede
  const fast =
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('chat') === 'fast';
  return {
    t: 0,
    next: fast ? 0.3 : 1.2,
    slots: Array.from({ length: slots }, () => null),
    until: new Float64Array(speakers),
    recent: [],
    rng: mulberry32(0x5eed),
    fast,
    measure: null,
  };
}

/** Dünya noktası → ekran pikseli (y aşağı). Kameranın arkasındaysa false. */
function toScreen(x: number, y: number, z: number, camera: THREE.Camera, v: BubbleView, out: { x: number; y: number; depth: number }) {
  tmpView.set(x, y, z).applyMatrix4(camera.matrixWorldInverse);
  if (tmpView.z > -0.1) return false;
  tmp.set(x, y, z).project(camera);
  out.x = ((tmp.x + 1) / 2) * v.w;
  out.y = ((1 - tmp.y) / 2) * v.h;
  out.depth = -tmpView.z;
  return true;
}

const overlaps = (a: Box, b: Box, pad = 4) => a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad;

/** HUD: sol üst başlık, sağ üst Çık + Konuşmalar, sağ alt joystick. */
function hitsHud(b: Box, v: BubbleView) {
  if (b.y0 < 112 && b.x0 < Math.min(v.w * 0.62, 470)) return true;
  if (b.y0 < 128 && b.x1 > v.w - 280) return true;
  return b.y1 > v.h - 178 && b.x1 > v.w - 155;
}

const inView = (b: Box, v: BubbleView) => b.x0 >= MARGIN && b.x1 <= v.w - MARGIN && b.y0 >= MARGIN && b.y1 <= v.h - MARGIN;

export type TickCtx = {
  level: 0 | 1;
  inside: boolean;
  enabled: boolean;
  quiet: boolean;
  reduced: boolean;
  hero: { x: number; y: number; z: number };
  view: BubbleView;
  brand: BrandPalette;
};

const anchor = { x: 0, y: 0, depth: 0 };
const heroBox: Box = { x0: 0, y0: 0, x1: 0, y1: 0 };
const box: Box = { x0: 0, y0: 0, x1: 0, y1: 0 };

/** Balonun ekrandaki kutusu (kuyruk ucu konuşanın başında). */
function boxAt(sp: Speaker, wPx: number, hPx: number, camera: THREE.Camera, v: BubbleView, out: Box) {
  if (!toScreen(sp.ref.x, sp.talk.headY, sp.ref.z, camera, v, anchor)) return false;
  out.x0 = anchor.x - wPx / 2;
  out.x1 = anchor.x + wPx / 2;
  out.y0 = anchor.y - hPx;
  out.y1 = anchor.y;
  return true;
}

/** Konuşan kamera ile kahraman arasında mı (shader'daki soluklaşma testiyle aynı)? */
function onHeroLine(sp: Speaker, camera: THREE.Camera, hero: TickCtx['hero']) {
  const dx = sp.ref.x - camera.position.x;
  const dz = sp.ref.z - camera.position.z;
  const hx = hero.x - camera.position.x;
  const hz = hero.z - camera.position.z;
  const t = (dx * hx + dz * hz) / Math.max(hx * hx + hz * hz, 1e-4);
  if (t <= 0.05 || t >= 0.97) return false;
  const c = Math.min(1, Math.max(0, t));
  const off = Math.hypot(dx - hx * c, dz - hz * c);
  return off < 0.32 + 0.25 * c && Math.abs(sp.talk.headY - hero.y) < 2.5;
}

/**
 * Balon kutusu geçerli mi? Diğer balonlarla yalnız kendinden ESKİ olanlara bakılır (`since`):
 * çakışmada yenisi söner, iki balon birbirini aynı anda söndürmez. Yeni aday için `since` ∞.
 */
function valid(sp: Speaker, b: Box, self: Slot | null, since: number, d: Director, ctx: TickCtx, camera: THREE.Camera) {
  if (!inView(b, ctx.view) || hitsHud(b, ctx.view) || overlaps(b, heroBox, 2)) return false;
  for (let j = 0; j < d.slots.length; j++) {
    const o = d.slots[j];
    if (o && o !== self && o.start < since && overlaps(b, o.box)) return false;
  }
  return !onHeroLine(sp, camera, ctx.hero);
}

export function directorTick(d: Director, speakers: readonly Speaker[], camera: THREE.Camera, ctx: TickCtx, dt: number) {
  d.t += dt;
  const t = d.t;
  const v = ctx.view;
  const zones = visibleZones(ctx.level, ctx.inside);

  // kahramanın ekran kutusu (balon üstüne binmesin — "kahraman konuşuyor" sanılmasın)
  const hasHero = toScreen(ctx.hero.x, ctx.hero.y, ctx.hero.z, camera, v, anchor);
  if (hasHero) {
    const ppm = v.h / (2 * anchor.depth * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov) / 2));
    heroBox.x0 = anchor.x - HERO_HALF_W * ppm;
    heroBox.x1 = anchor.x + HERO_HALF_W * ppm;
    heroBox.y1 = anchor.y;
    heroBox.y0 = anchor.y - HERO_H * ppm;
  } else {
    heroBox.x0 = heroBox.x1 = heroBox.y0 = heroBox.y1 = -1e4;
  }

  // etkin balonlar her kare denetlenir (eskiden yeniye: yenisi eskisine binerse yenisi söner)
  for (let i = 0; i < d.slots.length; i++) {
    const s = d.slots[i];
    if (!s) continue;
    const sp = speakers[s.speaker];
    if (s.end > t) {
      const ok =
        ctx.enabled &&
        !!sp &&
        (sp.ref.vis ?? 1) >= 0.4 &&
        zones.includes(sp.talk.zone) &&
        boxAt(sp, s.layout.bw * v.k, s.layout.bh * v.k, camera, v, s.box) &&
        anchor.depth <= MAX_D + 4 &&
        valid(sp, s.box, s, s.start, d, ctx, camera);
      if (!ok) s.end = t;
    }
    if (t > s.end + FADE_OUT) d.slots[i] = null;
  }

  if (!ctx.enabled || ctx.quiet || t < d.next) return;
  const free = d.slots.indexOf(null);
  if (free < 0) return;
  d.next = t + (d.fast ? 0.3 : 0.9 + d.rng() * 1.3);

  // aday: tahmini (en geniş) kutu sığıyorsa; sonra gerçek satırın kutusu doğrulanır
  const estW = (v.textW + 40) * v.k;
  const estH = 96 * v.k;
  let best = -1;
  let bestScore = -1;
  for (let i = 0; i < speakers.length; i++) {
    const sp = speakers[i];
    if (!sp || (d.until[i] ?? 0) > t || !zones.includes(sp.talk.zone) || (sp.ref.vis ?? 1) < 0.9) continue;
    if (d.slots.some((s) => s?.speaker === i)) continue;
    if (!boxAt(sp, Math.min(estW, v.w - 2 * MARGIN), estH, camera, v, box)) continue;
    const minD = sp.talk.pose === 'sit' ? MIN_D_SIT : MIN_D_STAND;
    if (anchor.depth < minD || anchor.depth > MAX_D) continue;
    if (!valid(sp, box, null, Infinity, d, ctx, camera)) continue;
    // yakındakiler biraz öncelikli, ama hep aynı kişi seçilmesin
    const score = 4 / anchor.depth + d.rng() * 0.6;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  const sp = speakers[best];
  if (!sp) return;
  const line = pickLine(sp.talk, d.recent, d.rng);
  if (!line) return;
  if (!d.measure) d.measure = document.createElement('canvas').getContext('2d');
  if (!d.measure) return;
  const layout = layoutBubble(d.measure, line.text, ctx.brand, v.textW);
  const real: Box = { x0: 0, y0: 0, x1: 0, y1: 0 };
  if (!boxAt(sp, layout.bw * v.k, layout.bh * v.k, camera, v, real) || !valid(sp, real, null, Infinity, d, ctx, camera)) return;
  d.slots[free] = {
    speaker: best,
    layout,
    lang: line.lang,
    start: t,
    end: t + lineDuration(line.text, ctx.reduced),
    dirty: true,
    box: real,
  };
  d.until[best] = t + (d.fast ? 4 : 28);
}
