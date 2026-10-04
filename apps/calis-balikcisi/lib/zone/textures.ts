/**
 * Zone dokuları — hepsi runtime'da `<canvas>` 2D ile üretilir (docs/zone-3d-modul.md bölüm 9).
 * GLB yok, indirilecek doku yok.
 *
 * Renkler: atmosfer/malzeme `SCENE_COLORS`'tan (frames.ts), marka `readBrand()`'den
 * (CSS değişkenleri). Koda marka hex'i gömülmez.
 *
 * Font tuzağı (bölüm 9): yazı içeren dokular `document.fonts` hazır olunca YENİDEN çizilir.
 */
import * as THREE from 'three';

import type { BrandPalette } from '@/lib/zone/brand';
import { SCENE_COLORS as C } from '@/lib/zone/frames';

/* ------------------------------- doku defteri ------------------------------- */

/**
 * WebGL bağlam sayacı elle üretilen dokuların sızıntısını GÖREMEZ. Üretim/bırakma burada,
 * renderer'dan bağımsız sayılır. Aç-kapa-aç'ta `alive` sabit, kapalıyken 0 olmalı (bölüm 11).
 */
const ledger = { created: 0, disposed: 0 };
const byLabel = new Map<string, number>();
export const textureLedger = () => ({
  ...ledger,
  alive: ledger.created - ledger.disposed,
  byLabel: Object.fromEntries(byLabel),
});

/**
 * Sayaca bağlar. **Bir kez sayar:** aynı doku hem sahibi hem `SceneDisposer` tarafından
 * bırakılabilir; iki kez saymak gerçek bir sızıntıyı gizlerdi.
 */
export function trackTexture<T extends THREE.Texture>(t: T, label = '?'): T {
  ledger.created += 1;
  byLabel.set(label, (byLabel.get(label) ?? 0) + 1);
  let counted = false;
  t.addEventListener('dispose', () => {
    t.userData.zoneDisposed = true;
    if (counted) return;
    counted = true;
    ledger.disposed += 1;
    byLabel.set(label, (byLabel.get(label) ?? 0) - 1);
  });
  return t;
}

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as Record<string, unknown>).__ZONE_TEXTURES__ = textureLedger;
}

/* ------------------------------ doku yuvaları ------------------------------ */

/**
 * **Doku `useMemo` ile üretilmez.** StrictMode çift render'ında `useMemo` sahipsiz doku
 * bırakır (MANCH'te tur başına +7). Yuva: aynı `slot` + `key` için hep aynı doku döner,
 * anahtar değişince eskisi bırakılır. Render sırasında çağrılması güvenli — idempotent.
 */
type TextureSlot = { key: string; texture: THREE.Texture };
const slots = new Map<string, TextureSlot>();

export function acquireTexture(
  slot: string,
  key: string,
  make: () => THREE.Texture,
): THREE.Texture {
  const current = slots.get(slot);
  if (current && current.key === key) return current.texture;
  current?.texture.dispose();
  const texture = make();
  slots.set(slot, { key, texture });
  return texture;
}

/** Sahne kapanırken tüm yuvalar bırakılır. */
export function releaseTextureSlots() {
  for (const s of slots.values()) s.texture.dispose();
  slots.clear();
}

/* --------------------------------- yardımcı --------------------------------- */

function cv(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function ctx(c: HTMLCanvasElement) {
  const x = c.getContext('2d');
  if (!x) throw new Error('zone: 2d canvas bağlamı alınamadı');
  return x;
}

/**
 * `anisotropy`: eğik bakılan yüzeylerde (deck tahtaları) uzakta titremeyi kesen ayar.
 * Çağıran `gl.capabilities.getMaxAnisotropy()` geçirir (bölüm 9).
 */
function tex(
  c: HTMLCanvasElement,
  label: string,
  { repeat, anisotropy = 4 }: { repeat?: [number, number]; anisotropy?: number } = {},
) {
  const t = trackTexture(new THREE.CanvasTexture(c), label);
  t.anisotropy = anisotropy;
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

/** Deterministik gürültü: dağ silueti her açılışta aynı çıksın. */
function ridge(u: number, seed: number) {
  return (
    Math.sin(u * 7.1 + seed) * 0.35 +
    Math.sin(u * 13.7 + seed * 2.3) * 0.18 +
    Math.sin(u * 29.3 + seed * 0.7) * 0.07
  );
}

function grain(x: CanvasRenderingContext2D, w: number, h: number, count: number, alpha: number) {
  x.globalAlpha = alpha;
  x.fillStyle = C.shadow;
  for (let i = 0; i < count; i++) x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  x.globalAlpha = 1;
}

/* --------------------------------- zeminler --------------------------------- */

/**
 * Karo zemin: kare karolar + derz, hafif ton farkı. Videodan: dış teras koyu gri (0.6 m),
 * iç mekân ve üst kat açık gri büyük karo (0.9 m). `repeat` = alanın metre / karo boyu.
 */
export function tileTexture(
  label: string,
  base: string,
  seam: string,
  anisotropy: number | undefined,
  repeat: [number, number],
) {
  const S = 256;
  const c = cv(S, S);
  const x = ctx(c);
  const tone = new THREE.Color(base);
  const cell = S / 2;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const t = tone.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.04);
      x.fillStyle = `#${t.getHexString()}`;
      x.fillRect(i * cell, j * cell, cell, cell);
    }
  }
  x.fillStyle = seam;
  for (let k = 0; k <= 2; k++) {
    x.fillRect(k * cell - 2, 0, 4, S);
    x.fillRect(0, k * cell - 2, S, 4);
  }
  grain(x, S, S, 900, 0.04);
  return tex(c, label, { anisotropy, repeat });
}

/** Reyon önündeki meşe şerit: tahtalar şerit boyunca (z) uzanır. */
export function oakTexture(anisotropy: number | undefined, repeat: [number, number]) {
  const S = 256;
  const c = cv(S, S);
  const x = ctx(c);
  const plank = S / 4;
  const base = new THREE.Color(C.oak);
  for (let i = 0; i < 4; i++) {
    const t = base.clone().offsetHSL(0, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.08);
    x.fillStyle = `#${t.getHexString()}`;
    x.fillRect(i * plank, 0, plank, S);
    x.fillStyle = C.oakSeam;
    x.fillRect(i * plank, ((i * 0.41 + 0.15) % 1) * S, plank, 2);
  }
  x.fillStyle = C.oakSeam;
  for (let i = 0; i <= 4; i++) x.fillRect(i * plank - 1, 0, 2, S);
  grain(x, S, S, 1200, 0.06);
  return tex(c, 'oak', { anisotropy, repeat });
}

/** Sahil yolu: kilit taşı, 1 m'de 4 taş. */
export function roadTexture(anisotropy?: number) {
  const S = 256;
  const c = cv(S, S);
  const x = ctx(c);
  x.fillStyle = C.road;
  x.fillRect(0, 0, S, S);
  x.strokeStyle = C.roadSeam;
  x.lineWidth = 3;
  const step = S / 4;
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? step / 2 : 0;
    x.beginPath();
    x.moveTo(0, row * step);
    x.lineTo(S, row * step);
    for (let k = -1; k <= 4; k++) {
      x.moveTo(k * step + off, row * step);
      x.lineTo(k * step + off, (row + 1) * step);
    }
    x.stroke();
  }
  grain(x, S, S, 1400, 0.06);
  return tex(c, 'road', { anisotropy, repeat: [340, 6] });
}

export function sandTexture(anisotropy?: number) {
  const S = 256;
  const c = cv(S, S);
  const x = ctx(c);
  x.fillStyle = C.sand;
  x.fillRect(0, 0, S, S);
  grain(x, S, S, 2600, 0.08);
  return tex(c, 'sand', { anisotropy, repeat: [120, 5] });
}

/* --------------------------------- gökyüzü --------------------------------- */

/**
 * Dikey gradient, küre UV'sine: kanvasın üstü zenit, ortası ekvator (ufuk), altı deniz.
 * Ufuk bandı dar tutulur — deniz kenarıyla (fog rengi = `horizon`) tek çizgi gibi okunur.
 */
export function skyTexture() {
  const c = cv(4, 1024);
  const x = ctx(c);
  const g = x.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, C.skyZenith);
  g.addColorStop(0.22, C.skyHigh);
  g.addColorStop(0.38, C.skyMid);
  g.addColorStop(0.465, C.skyLow);
  g.addColorStop(0.5, C.horizon);
  g.addColorStop(0.515, C.horizon);
  g.addColorStop(0.56, C.seaShallow);
  g.addColorStop(1, C.seaDeep);
  x.fillStyle = g;
  x.fillRect(0, 0, 4, 1024);
  const t = tex(c, 'sky');
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter;
  return t;
}

/** Güneş diski + hale. Toplamalı karışımla çizilir; ortası çekirdek, kenarı sıfır. */
export function sunTexture() {
  const S = 256;
  const c = cv(S, S);
  const x = ctx(c);
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  const glow = new THREE.Color(C.sunGlow);
  const rgb = `${Math.round(glow.r * 255)}, ${Math.round(glow.g * 255)}, ${Math.round(glow.b * 255)}`;
  g.addColorStop(0, C.sunCore);
  g.addColorStop(0.09, C.sunCore);
  g.addColorStop(0.12, `rgba(${rgb}, 0.85)`);
  g.addColorStop(0.3, `rgba(${rgb}, 0.32)`);
  g.addColorStop(0.6, `rgba(${rgb}, 0.1)`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  return tex(c, 'sun');
}

/**
 * Güneşe uzanan parıltı yolu: kısa yatay çizgiler, güneşe yaklaştıkça (kanvasın üstü)
 * yoğunlaşır. Kenarlar yumuşak söner.
 */
export function glitterTexture() {
  const W = 128;
  const H = 1024;
  const c = cv(W, H);
  const x = ctx(c);
  x.clearRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) {
    const t = Math.pow(Math.random(), 0.6); // 0 = uzak (üst), 1 = yakın (alt)
    const y = t * H;
    const spread = 0.18 + t * 0.32; // yakında yol genişler
    const px = W / 2 + (Math.random() - 0.5) * W * spread * 2;
    const len = 4 + Math.random() * (10 + (1 - t) * 18);
    x.globalAlpha = (1 - t) * 0.75 + 0.1;
    x.fillStyle = Math.random() < 0.3 ? C.sunCore : C.sunGlow;
    x.fillRect(px - len / 2, y, len, 1.5 + (1 - t));
  }
  x.globalAlpha = 1;
  // yanlardan sönme
  x.globalCompositeOperation = 'destination-in';
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.3, 'rgba(0,0,0,1)');
  g.addColorStop(0.7, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  return tex(c, 'glitter');
}

/** Deniz: yüzey rengi + açık dalga çizgileri. Kaydırılarak (offset) canlandırılır. */
export function seaTexture(anisotropy?: number, repeat = 70) {
  const S = 256;
  const c = cv(S, S);
  const x = ctx(c);
  x.fillStyle = C.seaSurface;
  x.fillRect(0, 0, S, S);
  x.strokeStyle = C.seaRipple;
  x.lineWidth = 2;
  for (let row = 0; row < 14; row++) {
    const y0 = (row / 14) * S + Math.random() * 6;
    x.globalAlpha = 0.35 + Math.random() * 0.35;
    x.beginPath();
    for (let px = 0; px <= S; px += 8) {
      const y = y0 + Math.sin((px / S) * Math.PI * 4 + row) * 3;
      if (px === 0) x.moveTo(px, y);
      else x.lineTo(px, y);
    }
    x.stroke();
  }
  x.globalAlpha = 1;
  return tex(c, 'sea', { anisotropy, repeat: [repeat, repeat] });
}

/**
 * Kara tarafı dağ silueti (Babadağ'ın kabaca karşılığı). İki sırt: uzak (açık) ve yakın
 * (koyu). Kanvasın altı dolu, üstü saydam; silindir şeridi olarak kubbenin önünde durur.
 */
export function mountainTexture() {
  const W = 2048;
  const H = 256;
  const c = cv(W, H);
  const x = ctx(c);
  x.clearRect(0, 0, W, H);
  /** Şeridin iki ucu sıfıra iner — silindir kesiği dikey bir duvar gibi görünmesin. */
  const edge = (u: number) => {
    const a = Math.min(1, u / 0.14);
    const b = Math.min(1, (1 - u) / 0.14);
    const t = Math.min(a, b);
    return t * t * (3 - 2 * t);
  };
  const layers: [string, number, number, number, number, number][] = [
    // renk, taban (0..1), sırt genliği, tohum, zirve konumu, zirve yüksekliği
    [C.mountainFar, 0.4, 0.16, 1.7, 0.36, 0.38],
    [C.mountain, 0.28, 0.12, 4.1, 0.62, 0.2],
  ];
  for (const [color, base, amp, seed, peakU, peakH] of layers) {
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(0, H);
    for (let px = 0; px <= W; px += 8) {
      const u = px / W;
      const peak = Math.exp(-Math.pow((u - peakU) / 0.11, 2)) * peakH;
      const hgt = Math.max(0, (base + ridge(u, seed) * amp + peak) * edge(u));
      x.lineTo(px, H - hgt * H);
    }
    x.lineTo(W, H);
    x.closePath();
    x.fill();
  }
  return tex(c, 'mountain');
}

/**
 * Körfezin karşı kıyısı (−z): alçak dağlar ve adalar, iki katman. `sunU` (0..1): güneşin
 * şeritteki konumu — orada siluet alçalır, güneş üstünde kalır.
 */
export function bayTexture(sunU: number) {
  const W = 2048;
  const H = 128;
  const c = cv(W, H);
  const x = ctx(c);
  x.clearRect(0, 0, W, H);
  const edge = (u: number) => {
    const a = Math.min(1, u / 0.12);
    const b = Math.min(1, (1 - u) / 0.12);
    const t = Math.min(a, b);
    return t * t * (3 - 2 * t);
  };
  const layers: [string, number, number, number][] = [
    [C.bayFar, 0.55, 0.22, 2.3],
    [C.bay, 0.32, 0.18, 5.9],
  ];
  for (const [color, base, amp, seed] of layers) {
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(0, H);
    for (let px = 0; px <= W; px += 8) {
      const u = px / W;
      const valley = 1 - Math.exp(-Math.pow((u - sunU) / 0.08, 2)) * 0.85;
      const hgt = Math.max(0, (base + ridge(u, seed) * amp) * edge(u) * valley);
      x.lineTo(px, H - hgt * H);
    }
    x.lineTo(W, H);
    x.closePath();
    x.fill();
  }
  return tex(c, 'bay');
}

/* --------------------------------- duvarlar --------------------------------- */

/** Badana: iç duvarlar, dış teras uç duvarları. */
export function wallTexture(anisotropy?: number) {
  const S = 256;
  const c = cv(S, S);
  const x = ctx(c);
  x.fillStyle = C.wall;
  x.fillRect(0, 0, S, S);
  x.globalAlpha = 0.2;
  x.fillStyle = C.wallShade;
  for (let i = 0; i < 14; i++) {
    x.beginPath();
    x.ellipse(Math.random() * S, Math.random() * S, 10 + Math.random() * 30, 5 + Math.random() * 12, 0, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
  grain(x, S, S, 600, 0.03);
  return tex(c, 'wall', { anisotropy, repeat: [6, 1] });
}

/** Kanvas x'i ↔ dünya x'i (cephe ve arka duvar kanvasları için, metre başına sabit piksel). */
const PXM = 48;

/** Cephe pencereleri (kanvas pikseli): 1.3 m genişlik, 2.6 m yükseklik, 2.0 m arayla; kapıların önünde yok. */
function eachFacadeWindow(
  x: CanvasRenderingContext2D,
  doors: readonly (readonly [number, number])[],
  widthM: number,
  heightM: number,
  pxm: number,
  draw: (path: () => void, cx: number, top: number, bottom: number) => void,
) {
  const isDoor = (wx: number) => doors.some(([a, b]) => wx > a - 0.3 && wx < b + 0.3);
  for (let wx = -widthM / 2 + 1.2; wx < widthM / 2 - 0.6; wx += 2.0) {
    if (isDoor(wx)) continue;
    const cx = (wx + widthM / 2) * pxm;
    const w = 1.3 * pxm;
    const top = (heightM - 2.75) * pxm;
    const bottom = (heightM - 0.15) * pxm;
    const path = () => {
      x.beginPath();
      x.moveTo(cx - w / 2, bottom);
      x.lineTo(cx - w / 2, top + w / 2);
      x.arc(cx, top + w / 2, w / 2, Math.PI, 0);
      x.lineTo(cx + w / 2, bottom);
      x.closePath();
    };
    draw(path, cx, top, bottom);
  }
}

/**
 * Zemin kat cephesinin DUVARI (z = −3, 30 × 3.2 m), iki yönden görünür: beyaz duvar ve koyu
 * çerçeveler. Pencereler ve kapı açıklıkları TAM saydam — materyalde `alphaTest` ile hiç
 * çizilmez, derinlik yazmaz. Cam ayrı düzlemde (`facadeGlassTexture`): duvar opak çizilir,
 * cam derinlik yazmaz → karakter camın arkasında kaybolmaz (inceleme).
 */
export function facadeTexture(doors: readonly (readonly [number, number])[], widthM: number, heightM: number) {
  const W = Math.round(widthM * PXM);
  const H = Math.round(heightM * PXM);
  const c = cv(W, H);
  const x = ctx(c);
  x.fillStyle = C.wall;
  x.fillRect(0, 0, W, H);
  grain(x, W, H, 2000, 0.03);
  const toPx = (wx: number) => (wx + widthM / 2) * PXM;
  x.strokeStyle = C.frame;
  eachFacadeWindow(x, doors, widthM, heightM, PXM, (path, cx, top, bottom) => {
    path();
    x.globalCompositeOperation = 'destination-out';
    x.fill();
    x.globalCompositeOperation = 'source-over';
    x.lineWidth = 4;
    x.stroke();
    x.beginPath();
    x.moveTo(cx, top);
    x.lineTo(cx, bottom);
    x.lineWidth = 3;
    x.stroke();
  });
  // kapılar: tamamen açık (cam sürgü kenara çekilmiş), koyu kasa
  for (const [a, b] of doors) {
    const l = toPx(a);
    const r = toPx(b);
    const top = (heightM - 2.6) * PXM;
    x.clearRect(l, top, r - l, H - top);
    x.lineWidth = 6;
    x.strokeRect(l, top, r - l, H - top + 4);
  }
  return tex(c, 'facade');
}

/** Cephe camı: yalnız pencerelerde yarı saydam cam rengi, gerisi boş. Düz renk — düşük çözünürlük yeter. */
export function facadeGlassTexture(doors: readonly (readonly [number, number])[], widthM: number, heightM: number) {
  const pxm = 16;
  const c = cv(Math.round(widthM * pxm), Math.round(heightM * pxm));
  const x = ctx(c);
  const glass = new THREE.Color(C.glass);
  x.fillStyle = `rgba(${Math.round(glass.r * 255)}, ${Math.round(glass.g * 255)}, ${Math.round(glass.b * 255)}, 0.28)`;
  eachFacadeWindow(x, doors, widthM, heightM, pxm, (path) => {
    path();
    x.fill();
  });
  return tex(c, 'facadeGlass');
}

/**
 * Cephe tabela bandı (zemin kat tavanı ile üst kat zemini arası, 0.8 m): beyaz bant, ortada
 * mavi tabela — videodaki beyaz çizgi balık logosu + "Çalış Balıkçısı". Akşamda okunsun diye
 * materyalde `emissiveMap` olarak da kullanılır.
 */
export function signBandTexture(brand: BrandPalette, widthM: number, revision = 0) {
  const W = Math.round(widthM * PXM);
  const H = Math.round(0.8 * PXM * 2);
  const c = cv(W, H);
  const x = ctx(c);
  x.fillStyle = C.wall;
  x.fillRect(0, 0, W, H);
  const sw = 12 * PXM;
  const sx = W / 2 - sw / 2;
  x.fillStyle = C.stairBlue;
  x.fillRect(sx, 6, sw, H - 12);
  x.strokeStyle = '#ffffff';
  x.lineWidth = 3;
  // tahta panel çizgileri
  x.globalAlpha = 0.25;
  for (let y = 18; y < H - 12; y += 14) {
    x.beginPath();
    x.moveTo(sx + 4, y);
    x.lineTo(sx + sw - 4, y);
    x.stroke();
  }
  x.globalAlpha = 1;
  // balık logosu (çizgi)
  const fx = sx + 70;
  const fy = H / 2;
  x.lineWidth = 5;
  x.beginPath();
  x.ellipse(fx, fy, 34, 18, 0, 0, Math.PI * 2);
  x.moveTo(fx + 30, fy);
  x.lineTo(fx + 56, fy - 16);
  x.lineTo(fx + 56, fy + 16);
  x.closePath();
  x.stroke();
  x.beginPath();
  x.arc(fx - 18, fy - 4, 4, 0, Math.PI * 2);
  x.fillStyle = '#ffffff';
  x.fill();
  x.fillStyle = '#ffffff';
  x.textAlign = 'left';
  x.textBaseline = 'middle';
  x.font = `600 ${Math.round(H * 0.46)}px ${brand.displayFont}`;
  x.fillText('Çalış Balıkçısı', fx + 80, fy + 2);
  const t = tex(c, 'signBand');
  t.userData.revision = revision;
  return t;
}

/** Mavi uzun altıgen karo (vitrin altı, reyon kolonu). */
export function hexTileTexture(anisotropy?: number) {
  const W = 128;
  const H = 128;
  const c = cv(W, H);
  const x = ctx(c);
  x.fillStyle = C.hexTile;
  x.fillRect(0, 0, W, H);
  x.strokeStyle = C.subway;
  x.lineWidth = 2;
  const hex = (cx: number, cy: number, rw: number, rh: number) => {
    x.beginPath();
    x.moveTo(cx, cy - rh);
    x.lineTo(cx + rw, cy - rh / 2);
    x.lineTo(cx + rw, cy + rh / 2);
    x.lineTo(cx, cy + rh);
    x.lineTo(cx - rw, cy + rh / 2);
    x.lineTo(cx - rw, cy - rh / 2);
    x.closePath();
  };
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const cx = col * 32 + (row % 2 ? 16 : 0);
      const cy = row * 48 + 16;
      hex(cx, cy, 16, 32);
      x.fillStyle = Math.random() < 0.4 ? C.hexTileLight : C.hexTile;
      x.fill();
      x.stroke();
    }
  }
  return tex(c, 'hexTile', { anisotropy, repeat: [12, 2] });
}

/** Vitrin üst bandı: mavi-beyaz dikey şerit (videodaki mavi lamel kaplama). */
export function stripeTexture(repeat: number) {
  const c = cv(32, 8);
  const x = ctx(c);
  x.fillStyle = C.stairBlue;
  x.fillRect(0, 0, 32, 8);
  x.fillStyle = '#ffffff';
  x.fillRect(24, 0, 8, 8);
  return tex(c, 'stripe', { repeat: [repeat, 1] });
}

/** Beyaz metro karo (vitrinin arkasındaki duvar). */
export function subwayTexture(anisotropy?: number) {
  const S = 128;
  const c = cv(S, S);
  const x = ctx(c);
  x.fillStyle = C.subway;
  x.fillRect(0, 0, S, S);
  x.strokeStyle = C.wallShade;
  x.lineWidth = 2;
  for (let row = 0; row < 8; row++) {
    const y = row * 16;
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(S, y);
    x.stroke();
    for (let k = 0; k <= 4; k++) {
      const xx = k * 32 + (row % 2 ? 16 : 0);
      x.beginPath();
      x.moveTo(xx, y);
      x.lineTo(xx, y + 16);
      x.stroke();
    }
  }
  return tex(c, 'subway', { anisotropy, repeat: [6, 2] });
}

/**
 * Vitrin içi: renkli meze tepsileri (üst raf) ve buz üstünde balıklar (alt raf). Uzaktan okunan
 * bir izlenim — tek tek ürün değil. Etiket yazısı yok.
 */
export function cabinetTexture(lengthM: number) {
  const W = Math.round(lengthM * 64);
  const H = 128;
  const c = cv(W, H);
  const x = ctx(c);
  x.fillStyle = '#e9eef0';
  x.fillRect(0, 0, W, H);
  const trays = ['#e8c547', '#d9573a', '#7fae4b', '#f0e2b6', '#c97b3d', '#a63c4c', '#9cc46b', '#f2b84b'];
  // üst raf: tepsiler
  for (let px = 4; px < W - 20; px += 26) {
    x.fillStyle = trays[Math.floor(Math.random() * trays.length)] ?? '#e8c547';
    x.fillRect(px, 10, 22, 34);
    x.fillStyle = 'rgba(255,255,255,0.35)';
    x.fillRect(px + 3, 13, 6, 6);
  }
  // alt raf: buz + balık
  x.fillStyle = '#dfe9ee';
  x.fillRect(0, 60, W, 64);
  for (let i = 0; i < W / 14; i++) {
    const fx = Math.random() * W;
    const fy = 70 + Math.random() * 44;
    x.save();
    x.translate(fx, fy);
    x.rotate((Math.random() - 0.5) * 0.8);
    x.fillStyle = Math.random() < 0.3 ? '#c9707a' : '#9aa3ad';
    x.beginPath();
    x.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
    x.fill();
    x.restore();
  }
  x.fillStyle = '#e8c547';
  for (let i = 0; i < W / 40; i++) {
    x.beginPath();
    x.arc(Math.random() * W, 76 + Math.random() * 40, 3.5, 0, Math.PI * 2);
    x.fill();
  }
  return tex(c, 'cabinet');
}

/**
 * Salon tavanındaki beyaz kumaş "dalga" askısı: dikey kıvrımlar, alt kenarı dalgalı ve saydam.
 * Çift yüzlü düzlem olarak meşe kirişin altına asılır.
 */
export function fabricTexture(repeat: number) {
  const W = 128;
  const H = 64;
  const c = cv(W, H);
  const x = ctx(c);
  x.clearRect(0, 0, W, H);
  for (let px = 0; px < W; px++) {
    const fold = 0.82 + Math.sin((px / W) * Math.PI * 6) * 0.12;
    const bottom = H * (0.72 + Math.sin((px / W) * Math.PI * 4) * 0.18);
    x.fillStyle = `rgba(${Math.round(250 * fold)}, ${Math.round(248 * fold)}, ${Math.round(243 * fold)}, 0.95)`;
    x.fillRect(px, 0, 1, bottom);
  }
  return tex(c, 'fabric', { repeat: [repeat, 1] });
}

/**
 * Üst kat arka duvarı: beyaz zemin üstüne büyük mavi dalga ve iki "göz" — videodaki duvar resmi.
 */
export function muralTexture(widthM: number, heightM: number) {
  const W = Math.round(widthM * 32);
  const H = Math.round(heightM * 32);
  const c = cv(W, H);
  const x = ctx(c);
  x.fillStyle = C.wall;
  x.fillRect(0, 0, W, H);
  const wave = (y0: number, amp: number, color: string) => {
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(0, H);
    for (let px = 0; px <= W; px += 6) {
      x.lineTo(px, y0 + Math.sin((px / W) * Math.PI * 3.2) * amp);
    }
    x.lineTo(W, H);
    x.closePath();
    x.fill();
  };
  wave(H * 0.3, H * 0.12, '#bcd9e6');
  wave(H * 0.42, H * 0.1, '#6fa9cc');
  wave(H * 0.58, H * 0.08, C.stairBlue);
  // iki göz (videodaki balık gözleri)
  for (const ex of [W * 0.42, W * 0.58]) {
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.ellipse(ex, H * 0.28, 22, 13, 0, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#21486b';
    x.beginPath();
    x.arc(ex + 4, H * 0.28, 7, 0, Math.PI * 2);
    x.fill();
  }
  return tex(c, 'mural');
}

/* ------------------------------ panolar (Faz 3) ------------------------------ */

/**
 * Panonun önündeki halka: kesikli dış çember + ince iç çember + içe bakan 4 ok (bölüm 7.2).
 * Koyu ahşap deck üstünde okunsun diye marka kumu (`--color-fg`) ile çizilir.
 */
export function markerTexture(brand: BrandPalette, anisotropy?: number) {
  const c = cv(512, 512);
  const x = ctx(c);
  x.clearRect(0, 0, 512, 512);
  x.strokeStyle = brand.fg;
  x.globalAlpha = 0.85;
  x.lineWidth = 11;
  x.setLineDash([34, 26]);
  x.beginPath();
  x.arc(256, 256, 214, 0, Math.PI * 2);
  x.stroke();
  x.setLineDash([]);
  x.globalAlpha = 0.4;
  x.lineWidth = 5;
  x.beginPath();
  x.arc(256, 256, 168, 0, Math.PI * 2);
  x.stroke();
  x.globalAlpha = 0.8;
  x.lineWidth = 13;
  x.lineCap = 'round';
  x.lineJoin = 'round';
  for (let i = 0; i < 4; i++) {
    x.save();
    x.translate(256, 256);
    x.rotate((i * Math.PI) / 2);
    x.beginPath();
    x.moveTo(-26, -140);
    x.lineTo(0, -110);
    x.lineTo(26, -140);
    x.stroke();
    x.restore();
  }
  x.globalAlpha = 1;
  return tex(c, 'marker', { anisotropy });
}

/** Halkanın nabzı — beyaz çizilir, materyalde marka aksanıyla boyanır. */
export function pulseTexture(anisotropy?: number) {
  const c = cv(256, 256);
  const x = ctx(c);
  x.clearRect(0, 0, 256, 256);
  x.strokeStyle = '#fff';
  x.lineWidth = 14;
  x.beginPath();
  x.arc(128, 128, 110, 0, Math.PI * 2);
  x.stroke();
  return tex(c, 'pulse', { anisotropy });
}

/** Pano görseli gelene kadar: marka laciverti + çapraz çizgi + başlık. Kırık görsel yok. */
export function artPlaceholderTexture(brand: BrandPalette, title: string, kicker: string) {
  const W = 432;
  const H = 552;
  const c = cv(W, H);
  const x = ctx(c);
  x.fillStyle = brand.bg;
  x.fillRect(0, 0, W, H);
  x.strokeStyle = brand.fg;
  x.globalAlpha = 0.12;
  x.lineWidth = 3;
  for (let i = -H; i < W + H; i += 26) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i + H, H);
    x.stroke();
  }
  x.globalAlpha = 1;
  x.textAlign = 'center';
  x.fillStyle = brand.accent;
  x.font = `400 26px ${brand.bodyFont}`;
  x.fillText(kicker.toUpperCase(), W / 2, H / 2 - 44);
  x.fillStyle = brand.fg;
  x.font = `600 58px ${brand.displayFont}`;
  x.fillText(title, W / 2, H / 2 + 24);
  return tex(c, 'art');
}

/**
 * İletişim panosunun yüzü: başlık, iki telefon, çalışma saatleri. Sahnede uzaktan okunsun diye
 * büyük ve yüksek kontrastlı (lacivert üstüne kum/aksan). Yazılı doku — font gelince yeniden çizilir.
 */
export function contactCardTexture(
  brand: BrandPalette,
  lines: { title: string; phones: readonly string[]; hours: string },
  revision = 0,
) {
  const W = 576;
  const H = 736;
  const c = cv(W, H);
  const x = ctx(c);
  x.fillStyle = brand.bg;
  x.fillRect(0, 0, W, H);
  x.strokeStyle = brand.accent;
  x.lineWidth = 4;
  x.strokeRect(18, 18, W - 36, H - 36);
  x.textAlign = 'center';
  x.fillStyle = brand.fg;
  x.font = `600 76px ${brand.displayFont}`;
  x.fillText(lines.title, W / 2, 150);
  x.fillStyle = brand.accent;
  x.fillRect(W / 2 - 40, 186, 80, 3);
  x.fillStyle = brand.fg;
  x.font = `600 52px ${brand.bodyFont}`;
  lines.phones.forEach((ph, i) => x.fillText(ph, W / 2, 300 + i * 84));
  x.fillStyle = brand.accent;
  x.font = `400 30px ${brand.bodyFont}`;
  x.fillText('Çalışma saatleri', W / 2, 520);
  x.fillStyle = brand.fg;
  x.font = `400 38px ${brand.bodyFont}`;
  x.fillText(lines.hours, W / 2, 578);
  const t = tex(c, 'art');
  t.userData.revision = revision;
  return t;
}

/* ------------------------------- gölge (bölüm 1) ------------------------------ */

/** Karakterin altındaki yumuşak gölge — gölge haritası kapalı. */
function shadowTexture(anisotropy?: number) {
  const S = 128;
  const c = cv(S, S);
  const x = ctx(c);
  const shade = new THREE.Color(C.shadow);
  const rgb = `${Math.round(shade.r * 255)}, ${Math.round(shade.g * 255)}, ${Math.round(shade.b * 255)}`;
  const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2 - 2);
  g.addColorStop(0, `rgba(${rgb}, 0.55)`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  return tex(c, 'shadow', { anisotropy });
}

let shadowSingleton: { anisotropy: number; texture: THREE.Texture } | null = null;

export function acquireShadowTexture(anisotropy: number) {
  if (shadowSingleton?.anisotropy !== anisotropy) {
    shadowSingleton?.texture.dispose();
    shadowSingleton = { anisotropy, texture: shadowTexture(anisotropy) };
  }
  return shadowSingleton.texture;
}

export function releaseShadowTexture() {
  shadowSingleton?.texture.dispose();
  shadowSingleton = null;
}

/* ------------------------------ font tuzağı (9) ------------------------------ */

/**
 * Web fontu canvas'a GEÇ yüklenir; ilk çizim yedek fontla kalır. `next/font` aileyi yalnız
 * sayfada kullanıldıysa indirir — canvas'ın kullanacağı ağırlık burada AÇIKÇA istenir,
 * sonra `fonts.ready` beklenir ve `redraw` bir kez çağrılır.
 */
export async function redrawTextTextures(fonts: readonly string[], redraw: () => void) {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all(fonts.map((f) => document.fonts.load(f)));
  } catch {
    /* font gelmezse yedek fontla devam — sahne yine çizilir */
  }
  await document.fonts.ready;
  redraw();
}
