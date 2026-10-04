'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import h from '../home.module.css';
import { PlayPauseIcon } from '../media/video-toggle';
import { lowData, onZoneToggle, prefersStill, zoneIsOpen } from '../media/video-env';

/**
 * Hero Zone filmi. Kaynak İLK YÜKTE YOK: sayfa yüklendikten sonra boşta kalınca iner (poster
 * LCP olur). Hero %10'dan az görünürken, sekme gizliyken ya da Zone perdesi açıkken durur.
 * Hareket azaltma / veri tasarrufunda inmez; "Oynat" isteğe bağlı açar (WCAG 2.2.2).
 * Açılamazsa poster kalır, düğme gizlenir; 8 sn bekçisi yalnız "şimdilik" der — film sonradan
 * oynarsa (yavaş ağ) düğme geri gelir. Döngü kesintisiz (kurguda son → baş geçişi).
 */
type HeroState = { paused: boolean; failed: boolean; toggle: () => void };
const HeroCtx = createContext<HeroState>({ paused: false, failed: false, toggle: () => {} });

export function HeroVideoProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (prefersStill() || lowData()) setPaused(true);
    const onFail = () => setFailed(true);
    const onOk = () => setFailed(false);
    window.addEventListener('calis:hero-video-failed', onFail);
    window.addEventListener('calis:hero-video-ok', onOk);
    return () => {
      window.removeEventListener('calis:hero-video-failed', onFail);
      window.removeEventListener('calis:hero-video-ok', onOk);
    };
  }, []);
  return <HeroCtx.Provider value={{ paused, failed, toggle: () => setPaused((p) => !p) }}>{children}</HeroCtx.Provider>;
}

type HeroVideoProps = { webm: string; mp4: string };

export function HeroVideo({ webm, mp4 }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const { paused } = useContext(HeroCtx);
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);

  // sayfa yüklendikten sonra, boşta: LCP'yi (poster) geciktirmesin
  // (hareket azaltma: sağlayıcı bu efektten SONRA durdurur — bekleyen istek iptal edilir)
  useEffect(() => {
    if (paused || armed) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    let idle = 0;
    let timer = 0;
    const arm = () => {
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setArmed(true), { timeout: 1500 });
      else timer = window.setTimeout(() => setArmed(true), 200);
    };
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => {
      window.removeEventListener('load', arm);
      if (idle) w.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, [paused, armed]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !armed) return;
    let visible = true;
    let zone = zoneIsOpen();
    const sync = () => {
      if (visible && !zone && !document.hidden && !paused) v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e && e.intersectionRatio >= 0.1;
      sync();
    }, { threshold: [0, 0.1] });
    io.observe(v);
    const offZone = onZoneToggle((open) => {
      zone = open;
      sync();
    });
    document.addEventListener('visibilitychange', sync);
    const watchdog = window.setTimeout(() => {
      if (v.readyState < 3 && !paused) window.dispatchEvent(new Event('calis:hero-video-failed'));
    }, 8000);
    sync();
    return () => {
      io.disconnect();
      offZone();
      document.removeEventListener('visibilitychange', sync);
      window.clearTimeout(watchdog);
    };
  }, [armed, paused]);

  if (!armed) return null;
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onPlaying={() => {
        setReady(true);
        window.dispatchEvent(new Event('calis:hero-video-ok'));
      }}
      onError={() => window.dispatchEvent(new Event('calis:hero-video-failed'))}
      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[600ms] ease-linear"
      style={{ objectPosition: 'var(--hero-focus, 50% 50%)', opacity: ready ? 1 : 0 }}
    >
      <source src={webm} type="video/webm" />
      {/* kaynak hataları <video>'ya değil <source>'a düşer: son kaynak da açılmazsa gerçekten yok */}
      <source src={mp4} type="video/mp4" onError={() => window.dispatchEvent(new Event('calis:hero-video-failed'))} />
    </video>
  );
}

export function HeroVideoToggle() {
  const { paused, failed, toggle } = useContext(HeroCtx);
  if (failed) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={paused ? 'Arka plan videosunu oynat' : 'Arka plan videosunu durdur'}
      className={`${h.label} inline-flex min-h-11 min-w-11 items-center justify-center gap-2`}
    >
      <PlayPauseIcon paused={paused} />
      <span aria-hidden="true">{paused ? 'Oynat' : 'Durdur'}</span>
    </button>
  );
}

/** Hero'nun durdur diski: telefonda yalnız simge, geniş ekranda yanında "Durdur / Oynat" etiketi. */
type HeroVideoDiskProps = { className?: string; labelClassName?: string; diskClassName?: string };

export function HeroVideoDisk({ className = '', labelClassName = '', diskClassName = '' }: HeroVideoDiskProps) {
  const { paused, failed, toggle } = useContext(HeroCtx);
  if (failed) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={paused ? 'Arka plan videosunu oynat' : 'Arka plan videosunu durdur'}
      className={className}
    >
      <span aria-hidden="true" className={labelClassName}>{paused ? 'Oynat' : 'Durdur'}</span>
      <span aria-hidden="true" className={diskClassName}>
        <PlayPauseIcon paused={paused} />
      </span>
    </button>
  );
}
