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
 * Performans: IntersectionObserver ile yalnız görünürken oynar, ekrandan çıkınca
 * duraklar. `prefers-reduced-motion` açıksa hiç oynamaz; poster görünür kalır.
 * preload="metadata" → poster anında, video baytları görünürken iner.
 */
export function WebVideo({ src, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // poster'da kal, autoplay yok

    const io = new IntersectionObserver(
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
    io.observe(v);
    return () => io.disconnect();
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
