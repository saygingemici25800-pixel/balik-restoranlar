/**
 * Marka renkleri ve fontları — CSS değişkenlerinden, runtime'da okunur.
 *
 * Canvas dokuları ve three materyalleri Tailwind sınıfı kullanamaz. Koda hex gömmek yerine
 * `--color-*` tokenları `<html>` üzerinden okunur (packages/design-tokens). Fontlar `next/font`
 * değişkenleri (`--font-display`, `--font-body`): canvas gerçek yüklenen aileyi kullanır.
 *
 * `three` import ETMEZ. Yalnız tarayıcıda (effect, handler ya da `<Canvas>` içi) çağrılır.
 */
export type BrandPalette = {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  /** Canvas `font` kısaltmasına doğrudan eklenebilen aile listesi. */
  displayFont: string;
  bodyFont: string;
};

/** Değişken boş gelirse (token dosyası yüklenmediyse) sahne yine de çizilebilsin. */
const FALLBACK: BrandPalette = {
  bg: 'black',
  fg: 'white',
  accent: 'goldenrod',
  muted: 'gray',
  displayFont: 'Georgia, serif',
  bodyFont: 'system-ui, sans-serif',
};

export function readBrand(): BrandPalette {
  if (typeof document === 'undefined') return FALLBACK;
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    bg: v('--color-bg', FALLBACK.bg),
    fg: v('--color-fg', FALLBACK.fg),
    accent: v('--color-accent', FALLBACK.accent),
    muted: v('--color-muted', FALLBACK.muted),
    displayFont: v('--font-display', FALLBACK.displayFont),
    bodyFont: v('--font-body', FALLBACK.bodyFont),
  };
}
