/**
 * Tohumlu rastgelelik (three'siz). Kalabalık her açılışta AYNI: ekran görüntüleri ve testler
 * karşılaştırılabilir kalsın. Masa başına ayrı akış — bir alanı değiştirmek başkasını bozmaz.
 */

/** FNV-1a 32 bit. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Küçük, hızlı PRNG: 0 ≤ r < 1. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)] as T;

/** Ağırlıklı seçim: `[değer, ağırlık]` çiftleri. */
export function weighted<T>(rng: Rng, items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [v, w] of items) {
    r -= w;
    if (r < 0) return v;
  }
  return (items[items.length - 1] as readonly [T, number])[0];
}
