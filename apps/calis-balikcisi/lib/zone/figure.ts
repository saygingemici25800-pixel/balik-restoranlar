/**
 * Karakter türleri ve açı → görünüm eşlemesi — **three.js'siz** (MANCH `capy.ts` karşılığı).
 *
 * Neden ayrı dosya: three gerektirmez. three içeren bir modülde dursaydı, bunları statik import
 * eden herhangi bir ana sayfa bileşeni (karakter seçimi) three'yi de ana sayfaya taşırdı
 * (docs/zone-3d-modul.md bölüm 10, sızıntı dersi).
 *
 * Karakterler (kapıda seçilir): genel bir "balıkçı" — bere, çizgili tişört — ya da etekli genç
 * bir kız; 3B gövdeleri `npc/body.ts`. Gerçek bir kişiyi temsil ETMEZLER (karar 2026-10-01:
 * gerçek kişiler karikatürleştirilmez). Görünüm kovaları QA sayaçları için (`__ZONE_STATS__`).
 */

export type CharView = 'back' | 'back34' | 'side' | 'front';
/** Kapıda seçilen karakter. */
export type HeroKind = 'erkek' | 'kiz';
export const HERO_KINDS: readonly HeroKind[] = ['erkek', 'kiz'];

export const CHAR_VIEWS: readonly CharView[] = ['back', 'back34', 'side', 'front'];

/* ------------------------------ açı → görünüm ------------------------------ */

/** |rel| 0 = sırtı dönük … π = yüzü bize dönük. 5 kova, 4 çizim (bölüm 6.1). */
const VIEW_BY_BUCKET: readonly CharView[] = ['back', 'back34', 'side', 'front', 'front'];

export function viewFor(rel: number): CharView {
  return VIEW_BY_BUCKET[Math.min(4, Math.round(Math.abs(rel) / (Math.PI / 4)))] ?? 'back';
}

/**
 * Sol taraf için ayrı çizim YOK — `scale.x = -1` ile aynalanır. `back` ve `front` simetrik
 * oldukları için aynalanmaz.
 */
export function mirrorFor(rel: number, view: CharView): boolean {
  return rel < 0 && view !== 'back' && view !== 'front';
}
