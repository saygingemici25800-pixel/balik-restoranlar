import { getLenis } from '@/app/_components/lenis-provider';

/**
 * Sayfa kaydırma kilidi — **sayaçlı**, tek doğruluk kaynağı (docs/zone-3d-modul.md bölüm 10).
 *
 * Neden sayaç: `overflow`'u kaydet/geri-yükle kalıbıyla yöneten iki yer üst üste binince birbirini
 * ezer ve site kilitli kalabilir. Burada kilit ilk `lockScroll()`'da konur, SON `unlockScroll()`'da
 * kalkar. Lenis (yumuşak kaydırma) da durdurulur — yoksa tekerlek perdenin arkasında sayfayı kaydırır.
 */
let depth = 0;
let restore = '';

export function lockScroll() {
  const html = document.documentElement;
  if (depth === 0) {
    restore = html.style.overflow;
    html.style.overflow = 'hidden';
    getLenis()?.stop();
  }
  depth += 1;
}

export function unlockScroll() {
  if (depth === 0) return;
  depth -= 1;
  if (depth === 0) {
    document.documentElement.style.overflow = restore;
    getLenis()?.start();
  }
}

/** Dev/QA: kilit derinliği. */
export const scrollLockDepth = () => depth;

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as Record<string, unknown>).__SCROLL_LOCK__ = scrollLockDepth;
}
