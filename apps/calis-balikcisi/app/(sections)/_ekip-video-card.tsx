'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';

// Sayfada aynı anda tek ekip videosu oynasın diye modül düzeyinde tek referans.
let activeVideo: HTMLVideoElement | null = null;

type Props = {
  /** R2 video URL'i (sesli). */
  video: string;
  /** Poster (ilk kare) — kartta ön görsel. */
  poster: string;
  name: string;
  title: string;
};

/**
 * Ekip kartı: poster + isim + ünvan. Karta/poster'a tıklayınca video SESLİ oynar,
 * LOOP YOK, bitince son karede durur. Aynı anda tek video oynar (yeni karta
 * basınca öteki durur). Menü/mekan videolarından farklı: sesli & tıkla-oynat.
 */
export function EkipVideoCard({ video, poster, name, title }: Props) {
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const start = useCallback(() => {
    setEnded(false);
    setPaused(false);
    setStarted(true);
    // Video bir sonraki frame'de mount olur; ondan sonra oynat.
    requestAnimationFrame(() => {
      const v = ref.current;
      if (!v) return;
      if (activeVideo && activeVideo !== v) activeVideo.pause();
      activeVideo = v;
      v.currentTime = 0;
      v.muted = false; // SESLİ (kullanıcı tıkladı → ses açılabilir)
      v.play().catch(() => {});
    });
  }, []);

  const toggle = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      if (activeVideo && activeVideo !== v) activeVideo.pause();
      activeVideo = v;
      v.muted = false;
      if (ended) v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [ended]);

  const onActivate = started ? toggle : start;
  const showBadge = !started || ended || paused;

  return (
    <figure className="text-center">
      <div
        className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-fg/5 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${name} — ${title} videosunu oynat`}
        onClick={onActivate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onActivate();
          }
        }}
      >
        {!started ? (
          <Image
            src={poster}
            alt={name}
            fill
            sizes="(min-width: 768px) 300px, 45vw"
            className="object-cover"
          />
        ) : (
          <video
            ref={ref}
            src={video}
            poster={poster}
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            onEnded={() => {
              setEnded(true);
              setPaused(true);
            }}
            onPause={() => setPaused(true)}
            onPlay={() => {
              setPaused(false);
              setEnded(false);
            }}
          />
        )}

        {showBadge ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
              {ended ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </span>
          </span>
        ) : null}
      </div>

      <figcaption className="mt-4">
        <span className="block font-display text-xl text-fg">{name}</span>
        <span className="mt-1 block text-sm leading-snug text-fg/55">
          {title}
        </span>
      </figcaption>
    </figure>
  );
}
