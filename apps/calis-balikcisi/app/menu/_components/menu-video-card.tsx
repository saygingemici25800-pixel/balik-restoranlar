"use client";

/**
 * MenuVideoCard — dokun & oyna
 * ------------------------------------------------------------------
 * Davranış (istenen):
 *  - Dokunmadan ÖNCE fotoğraf/thumbnail YOK. Nötr koyu kutu + ince bir ipucu.
 *  - Ayrı "oynat" tuşu YOK. Kartın TAMAMI tıklanabilir.
 *  - Dokununca video kendi başlar (autoplay), SESSİZ, mobil uyumlu.
 *  - 1 KEZ oynar (loop yok), bitince SON KAREDE kalır.
 *  - Sayfada aynı anda tek video oynar (yeni karta dokununca öteki durur).
 *
 * showThumbnail (varsayılan false): dokunmadan önce poster göstermez.
 *   İleride "fotoğraf görünsün" istersen true geç.
 */

import { useRef, useState, useCallback } from "react";

let activeVideo: HTMLVideoElement | null = null;

type Props = {
  video: string;
  poster?: string;          // dokunmadan önce GÖSTERİLMEZ (showThumbnail=true değilse)
  title?: string;
  showThumbnail?: boolean;
  className?: string;
};

export default function MenuVideoCard({
  video,
  poster,
  title = "",
  showThumbnail = false,
  className,
}: Props) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);
    requestAnimationFrame(() => {
      const v = ref.current;
      if (!v) return;
      if (activeVideo && activeVideo !== v) activeVideo.pause();
      activeVideo = v;
      v.currentTime = 0;
      v.play().catch(() => {});
    });
  }, [started]);

  return (
    <div
      className={`mvc ${className ?? ""}`}
      onClick={start}
      role={!started ? "button" : undefined}
      tabIndex={!started ? 0 : undefined}
      aria-label={!started ? (title ? `${title} videosunu oynat` : "Videoyu oynat") : undefined}
      onKeyDown={
        !started
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                start();
              }
            }
          : undefined
      }
    >
      {!started ? (
        <div className="mvc__idle">
          {showThumbnail && poster && (
            <img src={poster} alt="" className="mvc__media" loading="lazy" decoding="async" />
          )}
          <span className="mvc__hint" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      ) : (
        <video
          ref={ref}
          src={video}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          className="mvc__media"
          /* loop YOK · onEnded YOK -> video biter, son karede kalır */
        />
      )}

      <style>{`
        .mvc {
          position: relative; width: 100%; aspect-ratio: 1 / 1;
          overflow: hidden; border-radius: 14px;
          background: #131a26; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .mvc__idle { position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center; }
        .mvc__media { width: 100%; height: 100%; object-fit: cover; display: block; }
        .mvc__hint {
          position: absolute;
          display: inline-flex; align-items: center; justify-content: center;
          width: 50px; height: 50px; border-radius: 999px; color: #fff;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.20);
          transition: background .15s ease, transform .15s ease;
        }
        .mvc:hover .mvc__hint { background: rgba(255,255,255,.14); }
        .mvc:active .mvc__hint { transform: scale(.93); }
        .mvc:focus-visible { outline: 3px solid #d98a3d; outline-offset: -3px; }
        @media (prefers-reduced-motion: reduce) {
          .mvc__hint { transition: none; }
        }
      `}</style>
    </div>
  );
}
