'use client';

import { useEffect, useRef } from 'react';

type Props = {
  /** Tam video URL'i (R2). */
  src: string;
  /** Poster (ilk kare) — anında boyanır, video yüklenirken. */
  poster?: string;
  className?: string;
};

/**
 * Mekan/atmosfer videosu: SESSİZ + otomatik loop (menü ürün kartı davranışı DEĞİL).
 * Performans:
 * - Preload: video görünmeden ~600px önce (rootMargin) baytları indirmeye başlar,
 *   böylece görünür olunca hazır — geç açılmayı önler.
 * - Oynatma: yalnız gerçekten görünürken (threshold 0.25) oynar, ekrandan çıkınca
 *   duraklar (erken oynatma yok).
 * `prefers-reduced-motion` açıksa hiç oynamaz; poster görünür kalır.
 */
export function WebVideo({ src, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // poster'da kal, autoplay yok

    // Preload: yaklaşınca (~600px) indirmeye başla — görünene kadar bekleme.
    const preloadIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            v.preload = 'auto';
            v.load();
            preloadIo.disconnect();
            break;
          }
        }
      },
      { rootMargin: '600px 0px' },
    );
    preloadIo.observe(v);

    // Oynatma: yalnız görünürken oyna/duraklat.
    const playIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    playIo.observe(v);

    return () => {
      preloadIo.disconnect();
      playIo.disconnect();
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={className}
    />
  );
}
