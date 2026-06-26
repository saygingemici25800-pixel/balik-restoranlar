"use client";

/**
 * MenuVideoCard
 * -------------------------------------------------------------------
 * En hafif strateji: kart ilk halde sadece bir <img> poster (lazy) gösterir.
 * <video> DOM'a ANCAK kullanıcı dokununca girer -> dokunmadan 0 video byte'ı iner.
 *
 *  - sessiz (muted), mobil uyumlu (playsInline -> iOS'ta tam ekrana atlamaz)
 *  - bir kez oynar (loop yok), bitince SON KAREDE kalır
 *  - bittiğinde küçük bir "tekrar oynat" düğmesi çıkar (son karenin üstünde)
 *  - aynı anda tek video oynar: yeni bir karta basınca öteki durur
 *  - prefers-reduced-motion ve klavye odağı desteklenir
 *  - fill=true: caption olmadan, ebeveyni tamamen doldurur (sinema-modalı için)
 *
 * Kullanım:
 *   <MenuVideoCard
 *     poster="/menu/levrek-lokum.webp"
 *     video="https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev/menu/levrek-lokum.mp4"
 *     title="Levrek Lokum"
 *     price="₺320"
 *   />
 */

import { useRef, useState, useCallback } from "react";

// Sayfada aynı anda tek video oynasın diye modül düzeyinde tek referans.
let activeVideo: HTMLVideoElement | null = null;

type Props = {
  poster: string;
  video: string;
  title: string;
  price?: string;
  /** Kart en-boy oranı, örn "1 / 1" (kare), "4 / 5", "16 / 9". Varsayılan kare. */
  aspectRatio?: string;
  /** true: caption gizlenir ve figür ebeveynini (inset-0) tamamen doldurur. */
  fill?: boolean;
  className?: string;
};

export default function MenuVideoCard({
  poster,
  video,
  title,
  price,
  aspectRatio = "1 / 1",
  fill = false,
  className,
}: Props) {
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playNow = useCallback((v: HTMLVideoElement) => {
    if (activeVideo && activeVideo !== v) activeVideo.pause();
    activeVideo = v;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, []);

  const handleStart = useCallback(() => {
    setEnded(false);
    setStarted(true);
    // Video bir sonraki frame'de mount olur; ondan sonra oynat.
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (v) playNow(v);
    });
  }, [playNow]);

  const handleReplay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setEnded(false);
    playNow(v);
  }, [playNow]);

  return (
    <figure className={`mvc ${fill ? "mvc--fill" : ""} ${className ?? ""}`}>
      <div className="mvc__media" style={fill ? undefined : { aspectRatio }}>
        {!started ? (
          <button
            type="button"
            className="mvc__poster"
            onClick={handleStart}
            aria-label={`${title} videosunu oynat`}
          >
            <img
              src={poster}
              alt={title}
              loading="lazy"
              decoding="async"
              className="mvc__img"
            />
            <span className="mvc__badge" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        ) : (
          <>
            <video
              ref={videoRef}
              src={video}
              poster={poster}
              muted
              playsInline
              autoPlay
              preload="auto"
              disablePictureInPicture
              className="mvc__img"
              onEnded={() => setEnded(true)}
            />
            {ended && (
              <button
                type="button"
                className="mvc__replay"
                onClick={handleReplay}
                aria-label="Tekrar oynat"
              >
                <span className="mvc__badge" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
                  </svg>
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {!fill && (title || price) && (
        <figcaption className="mvc__caption">
          {title && <span className="mvc__title">{title}</span>}
          {price && <span className="mvc__price">{price}</span>}
        </figcaption>
      )}

      <style>{`
        .mvc { margin: 0; }
        .mvc__media {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 14px;
          background: var(--color-muted, #f1f0ed);
        }
        .mvc--fill { position: absolute; inset: 0; }
        .mvc--fill .mvc__media {
          height: 100%;
          border-radius: 0;
          background: transparent;
        }
        .mvc__poster, .mvc__replay {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          padding: 0; border: 0; cursor: pointer;
          background: transparent;
          display: flex; align-items: center; justify-content: center;
        }
        .mvc__img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .mvc__badge {
          position: absolute;
          display: inline-flex; align-items: center; justify-content: center;
          width: 46px; height: 46px;
          border-radius: 999px;
          background: rgba(0,0,0,.42);
          color: #fff;
          backdrop-filter: blur(2px);
          transition: transform .15s ease, background .15s ease;
        }
        .mvc__poster:hover .mvc__badge { background: rgba(0,0,0,.58); }
        .mvc__poster:active .mvc__badge,
        .mvc__replay:active .mvc__badge { transform: scale(.92); }
        .mvc__replay { background: rgba(0,0,0,.08); }
        .mvc__poster:focus-visible,
        .mvc__replay:focus-visible {
          outline: 3px solid var(--color-accent, #2b6cb0); outline-offset: -3px;
        }
        .mvc__caption {
          margin-top: 8px;
          display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
        }
        .mvc__title { font-size: .9rem; font-weight: 600; color: var(--color-fg, #1a1a1a); }
        .mvc__price { font-size: .9rem; color: var(--color-accent, #777); white-space: nowrap; }
        @media (prefers-reduced-motion: reduce) {
          .mvc__badge { transition: none; }
        }
      `}</style>
    </figure>
  );
}
