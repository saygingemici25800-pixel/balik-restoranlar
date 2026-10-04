'use client';

import { Html } from '@react-three/drei/web/Html';
import { useEffect, useRef } from 'react';

import { getFrame, getPortal, LEVEL_Y, promptAnchor } from '@/lib/zone/frames';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Panonun önünde asılı çağrı (docs/zone-3d-modul.md bölüm 7.3): başlık + GİR. Merdiven geçidinin
 * halkasındayken "Terasa çık" / "Aşağı in" düğmesi (E, Enter, Space ya da tık).
 *
 * `drei/<Html>` ile normal DOM: Türkçe karakter sorunu yok, klavyeyle erişilebilir. drei'den
 * YALNIZ `Html` alınır (doğrudan dosya yolu — barrel çekilmez, chunk büyümez).
 *
 * Çapa panodan 0.9 önde, alt kenarın hemen altında; kutu `translate(-50%, 0)` ile AŞAĞI sarkar
 * — pano görselinin üstüne binmez, zemin halkasıyla tek çağrı gibi okunur.
 */
export function FramePrompt() {
  const nearFrame = useZoneStore((s) => s.nearFrame);
  const nearPortal = useZoneStore((s) => s.nearPortal);
  const startTravel = useZoneStore((s) => s.startTravel);
  const state = useZoneStore((s) => s.state);
  const openFrame = useZoneStore((s) => s.openFrame);
  const returnFocus = useZoneStore((s) => s.returnFocus);
  const clearReturnFocus = useZoneStore((s) => s.clearReturnFocus);
  const enterBtn = useRef<HTMLButtonElement>(null);

  /**
   * POV kapanınca odak panoyu AÇAN düğmeye döner (bölüm 12). `<Html>` içeriğini DOM'a portal ile
   * sonradan bastığı için düğme ilk effect'te henüz yok — birkaç kare denenir, başarınca bırakılır.
   */
  useEffect(() => {
    if (!nearFrame || state !== 'zone') return;
    if (returnFocus !== nearFrame) return;
    let raf = 0;
    let tries = 0;
    const tryFocus = () => {
      const btn = enterBtn.current;
      if (btn) {
        btn.focus({ preventScroll: true });
        if (document.activeElement === btn) {
          clearReturnFocus();
          return;
        }
      }
      if (++tries < 20) raf = requestAnimationFrame(tryFocus);
    };
    raf = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(raf);
  }, [nearFrame, state, returnFocus, clearReturnFocus]);

  // POV'da ve geçişte gizlenir: pano açıkken / kat değişirken çağrı anlamsız.
  if (state !== 'zone') return null;
  const portal = nearPortal ? getPortal(nearPortal) : null;
  if (portal) {
    return (
      <Html
        position={[portal.x, LEVEL_Y[portal.level] + 1.15, portal.z]}
        center={false}
        zIndexRange={[20, 10]}
        style={{ transform: 'translate(-50%, 0)', pointerEvents: 'auto' }}
      >
        <button
          type="button"
          data-testid="portal-enter"
          data-portal={portal.id}
          onClick={() => startTravel(portal.id)}
          className="flex w-max items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-bg shadow-[0_4px_16px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg"
        >
          <span aria-hidden="true">{portal.to.level > portal.level ? '↑' : '↓'}</span>
          {portal.label}
          <kbd className="rounded border border-bg px-1 font-mono text-[10px] max-md:hidden">E</kbd>
        </button>
      </Html>
    );
  }
  if (!nearFrame) return null;
  const frame = getFrame(nearFrame);
  if (!frame) return null;

  return (
    <Html
      position={promptAnchor(frame)}
      center={false}
      zIndexRange={[20, 10]}
      style={{ transform: 'translate(-50%, 0)', pointerEvents: 'auto' }}
    >
      <div data-testid="frame-prompt" data-frame={frame.id} className="flex w-max flex-col items-center gap-1.5">
        <span className="rounded-full border border-accent bg-bg px-3 py-1 text-xs uppercase tracking-[0.18em] text-fg shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          {frame.title}
        </span>
        <button
          type="button"
          ref={enterBtn}
          data-testid="frame-enter"
          onClick={() => openFrame(frame.id)}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-bg shadow-[0_4px_16px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg"
        >
          Gir
          <kbd className="rounded border border-bg px-1 font-mono text-[10px] max-md:hidden">E</kbd>
        </button>
      </div>
    </Html>
  );
}
