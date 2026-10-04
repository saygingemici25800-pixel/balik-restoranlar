'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ComponentType } from 'react';

import type { ZoneCanvasProps } from '@/app/_components/zone/zone-canvas';
import type { HeroKind } from '@/lib/zone/figure';
import { useZoneStore } from '@/lib/zone/store';

/** Sahne chunk'ı gelmezse (iptal/ağ hatası) boş kalır — yakalanmamış red olmaz (bölüm 10). */
const ZoneUnavailable: ComponentType<ZoneCanvasProps> = () => (
  <div className="grid h-full w-full place-items-center bg-bg text-fg">Sahne yüklenemedi.</div>
);

/**
 * three SSR'da patlar — sahne asla sunucuda render edilmez. `next/dynamic` + `ssr:false`
 * aynı zamanda three/fiber'ı ayrı chunk'a alır.
 */
const ZoneCanvas = dynamic(
  () =>
    import('@/app/_components/zone/zone-canvas')
      .then((m) => m.ZoneCanvas)
      .catch(() => ZoneUnavailable),
  { ssr: false, loading: () => <div className="h-full w-full bg-bg" /> },
);

type Readout = {
  char: { x: number; z: number; ang: number };
  cam: { ang: number; fov: number | null };
  view: string;
  mirrored: boolean;
  spriteSource: string;
  meshes: number;
  drawCalls: number | null;
  textures: { alive: number };
};

const deg = (rad: number) => `${Math.round((rad * 180) / Math.PI)}°`;

const buttonClass =
  'rounded-full border border-accent bg-bg px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-fg hover:bg-accent hover:text-bg';

const heroFromQuery = (): HeroKind =>
  new URLSearchParams(window.location.search).get('hero') === 'kiz' ? 'kiz' : 'erkek';

export function ZoneStage() {
  /**
   * Aç/kapa düğmesi — sahnenin gerçek mount/unmount döngüsünü test eder. Navigasyonla ölçmek
   * yanıltıcı: tam yükleme modül sayaçlarını sıfırlar, sızıntı olsa bile test geçer.
   */
  const [mounted, setMounted] = useState(true);
  const zoneState = useZoneStore((s) => s.state);

  // Lab'da kapı yok: store gezilebilir duruma alınır, sahne üründeki akışla aynı davranır.
  // Karakter seçimi yükleyicide sorulur; lab `?hero=kiz` ile seçer (varsayılan balıkçı).
  useEffect(() => {
    const s = useZoneStore.getState();
    if (s.state === 'closed') s.enter();
    useZoneStore.getState().choose(heroFromQuery());
  }, []);

  const [readout, setReadout] = useState<Readout | null>(null);
  useEffect(() => {
    const id = setInterval(() => {
      const read = (window as unknown as { __ZONE_STATS__?: () => Readout }).__ZONE_STATS__;
      setReadout(read ? read() : null);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const toggle = () => {
    if (mounted) useZoneStore.getState().exit();
    else {
      useZoneStore.getState().enter();
      useZoneStore.getState().choose(heroFromQuery());
    }
    setMounted((v) => !v);
  };

  return (
    <>
      {mounted ? (
        <ZoneCanvas className="h-full w-full" onReady={() => useZoneStore.getState().ready()} />
      ) : (
        <div className="h-full w-full bg-bg" />
      )}

      <div className="pointer-events-none absolute left-4 top-4 z-10 text-xs uppercase tracking-[0.2em] text-accent">
        <p>Zone Lab · videoya göre iki kat + merdiven</p>
        <p className="mt-1 normal-case tracking-normal text-fg">
          WASD / ok tuşları ya da sağ alttaki joystick · W denize, S binaya · merdiven vitrinin yanındaki kapıda
        </p>
      </div>

      <div className="absolute bottom-4 left-4 z-[90] flex flex-col gap-2">
        {readout && (
          <div
            data-testid="zone-readout"
            className="rounded-md border border-accent bg-bg px-3 py-2 font-mono text-[11px] leading-relaxed text-fg"
          >
            <div>
              kamera {deg(readout.cam.ang)} · karakter {deg(readout.char.ang)} · fov{' '}
              {readout.cam.fov?.toFixed(1)}
            </div>
            <div>
              sprite {readout.view}
              {readout.mirrored ? ' (aynalı)' : ''} · {readout.spriteSource}
            </div>
            <div>
              konum x {readout.char.x.toFixed(1)} z {readout.char.z.toFixed(1)} · durum {zoneState}
            </div>
            <div>
              mesh {readout.meshes} · çizim {readout.drawCalls ?? '—'} · doku {readout.textures.alive}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" data-testid="zone-toggle" onClick={toggle} className={buttonClass}>
            {mounted ? 'Sahneyi kapat' : 'Sahneyi aç'}
          </button>
        </div>
      </div>
    </>
  );
}
