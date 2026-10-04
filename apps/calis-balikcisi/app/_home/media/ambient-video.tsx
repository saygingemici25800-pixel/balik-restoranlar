'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

import { useAmbient } from './ambient-group';
import { lowData, onZoneToggle, prefersStill, zoneIsOpen } from './video-env';

/**
 * Sessiz döngü videosu: poster (next/image) HER ZAMAN altta; video görünüme ~400 px kala iner,
 * en az yarısı görünürken oynar, hazır olunca posterin üstüne 600 ms'de gelir. Açılamazsa
 * (ağ engeli, 404) poster kalır — siyah kutu ya da bozuk oynatıcı yok. Adres sunucudan gelir
 * (`mediaUrl`), istemcide fs yok. `playThreshold`: CSS ile büyütülmüş (kırpılmış) karelerde görünür
 * oran hiç 0.5'e ulaşmaz — o kareler daha düşük eşik verir.
 */
type AmbientVideoProps = { src: string; poster: string; sizes: string; objectPosition?: string; playThreshold?: number };

export function AmbientVideo({ src, poster, sizes, objectPosition = '50% 50%', playThreshold = 0.5 }: AmbientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const id = useId();
  const { paused, report } = useAmbient();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const visible = useRef(false);
  const zoneOpen = useRef(false);

  const sync = () => {
    const v = ref.current;
    if (!v || !v.getAttribute('src')) return;
    if (visible.current && !paused && !zoneOpen.current) v.play().catch(() => {});
    else v.pause();
  };

  useEffect(() => {
    report(id, failed ? 'failed' : 'live');
  }, [id, failed, report]);
  useEffect(() => () => report(id, null), [id, report]);

  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return;
    zoneOpen.current = zoneIsOpen();
    // hareket azaltma / düşük veri: kullanıcı "oynat" demedikçe hiç İNMEZ; oynat/durdur her zaman çalışır
    const mayLoad = !paused || !(prefersStill() || lowData());
    const load = new IntersectionObserver(
      ([e]) => {
        if (mayLoad && e?.isIntersecting && !v.getAttribute('src')) {
          v.src = src;
          v.preload = 'auto';
          load.disconnect();
          sync();
        }
      },
      { rootMargin: '400px 0px' },
    );
    const play = new IntersectionObserver(
      ([e]) => {
        visible.current = !!e && e.intersectionRatio >= playThreshold;
        sync();
      },
      { threshold: [0, playThreshold] },
    );
    load.observe(v);
    play.observe(v);
    const off = onZoneToggle((open) => {
      zoneOpen.current = open;
      sync();
    });
    sync();
    return () => {
      load.disconnect();
      play.disconnect();
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, paused, failed, playThreshold]);

  return (
    <>
      <Image src={poster} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition }} />
      {failed ? null : (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => setReady(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[600ms] ease-linear"
          style={{ objectPosition, opacity: ready ? 1 : 0 }}
        />
      )}
    </>
  );
}
