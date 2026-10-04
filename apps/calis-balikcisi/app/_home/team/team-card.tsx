'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import h from '../home.module.css';
import { onZoneToggle } from '../media/video-env';
import { PlayPauseIcon } from '../media/video-toggle';

/** Sayfada aynı anda tek ekip videosu oynasın. */
let active: HTMLVideoElement | null = null;

/**
 * Ekip kartı: dokununca video SESLİ oynar, döngü yok, bitince başa sarılabilir. Yerel
 * `<button>` (klavye, ekran okuyucu). Video yalnız tıklanınca iner. Açılamazsa poster geri
 * gelir ve kısa bir not görünür (ekran okuyucuya da duyurulur) — siyah kart asla. Zone perdesi
 * açılınca sesli video durur (düğmesi perdenin arkasında kalır).
 */
type TeamCardProps = { no: string; name: string; role: string; poster: string; video: string };

export function TeamCard({ no, name, role, poster, video }: TeamCardProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => onZoneToggle((open) => {
    if (open) ref.current?.pause();
  }), []);

  const fail = useCallback(() => {
    setFailed(true);
    setStarted(false);
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (active && active !== v) active.pause();
    active = v;
    v.muted = false;
    if (v.ended) v.currentTime = 0;
    v.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === 'NotSupportedError') fail();
    });
  }, [fail]);

  const onClick = () => {
    if (!started) {
      setFailed(false);
      setStarted(true);
      requestAnimationFrame(play);
      return;
    }
    const v = ref.current;
    if (v && !v.paused) v.pause();
    else play();
  };

  return (
    <figure className="group">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${name}, ${role}: ${failed ? 'video şu an açılamıyor, tekrar dene' : playing ? 'videoyu duraklat' : 'videoyu sesli oynat'}`}
        className={`${h.frame} relative block aspect-[9/16] w-full ${playing ? 'outline outline-2 outline-offset-4 outline-ember' : ''}`}
      >
        <Image
          src={poster}
          alt=""
          fill
          sizes="(min-width:1024px) 270px, (min-width:640px) 30vw, 46vw"
          className="object-cover transition-transform duration-[600ms] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03]"
        />
        {started ? (
          <video
            ref={ref}
            src={video}
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={fail}
          />
        ) : null}
        {playing ? null : (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-fg/50 bg-bg/70 text-fg">
              <PlayPauseIcon paused />
            </span>
          </span>
        )}
        {failed ? (
          <span aria-hidden="true" className={`${h.label} pointer-events-none absolute inset-x-3 bottom-3 rounded-sm bg-bg/85 px-2 py-1.5 text-center normal-case tracking-normal text-fg`}>
            Video şu an açılamıyor
          </span>
        ) : null}
      </button>
      <span role="status" className="sr-only">
        {failed ? `${name}: video şu an açılamıyor.` : ''}
      </span>
      <figcaption className="mt-4">
        <span className={`${h.label} ${h.sun}`}>{no}</span>
        <span className={`${h.h3} mt-1 block ${playing ? h.sun : ''}`}>{name}</span>
        <span className={`${h.caption} mt-1 block min-h-[2.9em]`}>{role}</span>
      </figcaption>
    </figure>
  );
}
