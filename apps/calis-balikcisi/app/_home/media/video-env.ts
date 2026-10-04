/**
 * Video ortam kuralları (three'siz, istemci): veri tasarrufu / çok yavaş bağlantı ya da hareket
 * azaltma açıksa arka plan videoları kendiliğinden İNMEZ (kullanıcı "Oynat" ile açabilir).
 * Zone perdesi açıkken (`html[data-zone]`, `calis:zone` olayı) videolar durur.
 */
type NetInfo = { saveData?: boolean; effectiveType?: string };

export function prefersStill(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function lowData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const c = (navigator as Navigator & { connection?: NetInfo }).connection;
  return !!c?.saveData || c?.effectiveType === 'slow-2g' || c?.effectiveType === '2g';
}

export const zoneIsOpen = () => typeof document !== 'undefined' && document.documentElement.dataset.zone === 'open';

/** Zone perdesi açılıp kapanınca çağrılır; aboneliği kaldıran fonksiyonu döner. */
export function onZoneToggle(cb: (open: boolean) => void): () => void {
  const h = (e: Event) => cb((e as CustomEvent<{ open: boolean }>).detail.open);
  window.addEventListener('calis:zone', h);
  return () => window.removeEventListener('calis:zone', h);
}
