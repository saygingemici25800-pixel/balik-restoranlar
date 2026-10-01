'use client';

import dynamic from 'next/dynamic';

/** Chunk inmezse (ağ hatası/iptal) hero kendi zemininde kalır; hata sınırına düşmez. */
function HeroCanvasUnavailable() {
  return null;
}

/**
 * Hero'nun three.js sahnesi — ana sayfa bundle'ının DIŞINDA, ayrı chunk'ta yüklenir.
 *
 * Neden: three ana sayfanın ilk yükünü taşıyordu; Zone (R3F) eklenince paylaşılan three
 * modülü tam namespace'e dönüştü ve ana sayfa daha da büyüdü. Sahne artık hydration'dan sonra
 * iner; hero metni ve CTA'lar sunucudan gelir, canvas'ı beklemez (LCP metin).
 *
 * Yüklenene kadar yer tutucu YOK: hero'nun kendi zemini (body `bg` + gradient katmanı) görünür.
 * Canvas `fixed inset-0` kutuda ve ilk kare çizilince belirir (hero-canvas.tsx) — layout kaymaz,
 * siyah flaş olmaz.
 */
export const HeroCanvasLazy = dynamic(
  () =>
    import('./hero-canvas').then((m) => m.HeroCanvas).catch(() => HeroCanvasUnavailable),
  { ssr: false, loading: () => null },
);
