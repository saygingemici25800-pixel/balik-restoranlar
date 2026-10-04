'use client';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/lib/zone/hooks/use-reduced-motion';
import { setJoystick } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Sürüklenen yön kontrolü (docs/zone-3d-modul.md bölüm 8.1). MANCH'ten aynen.
 *
 * Her cihazda görünür, fareyle de sürüklenir. Çıktı **dünyaya göredir** ve klavyeyle aynı
 * vektörü besler (`readInput()` ikisini toplar). `<Canvas>` DIŞINDA durur.
 *
 * Erişilebilirlik: `aria-hidden` — klavye zaten global çalışıyor; ekran okuyucuya ikinci bir
 * kontrol sunulmaz. Odaklanabilir olmadığı için güvenli.
 */

const BASE = 112;
const KNOB = 50;
/** Topuz merkezden en fazla bu kadar uzaklaşır (yarıçap − 18). */
const MAX = BASE / 2 - 18;

export function Joystick() {
  const reduced = useReducedMotion();
  /** POV'da ve yüklenirken gizli. */
  const visible = useZoneStore((s) => s.state === 'zone');
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const pad = base.current;
    if (!visible || !pad) return;
    let active = false;

    const place = (e: MouseEvent | TouchEvent) => {
      const k = knob.current;
      if (!k) return;
      const r = pad.getBoundingClientRect();
      const pt = 'touches' in e ? e.touches[0] : e;
      if (!pt) return;
      const dx = pt.clientX - (r.left + r.width / 2);
      const dy = pt.clientY - (r.top + r.height / 2);
      // Topuz tabanın içinde kalır; imleç dışarı çıkabilir, vektör doygunluğa ulaşır.
      const d = Math.min(Math.hypot(dx, dy), MAX) || 0;
      const a = Math.atan2(dy, dx);
      const nx = Math.cos(a) * d;
      const ny = Math.sin(a) * d;
      k.style.transform = `translate(${nx}px, ${ny}px)`;
      setJoystick(nx / MAX, ny / MAX);
    };

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      active = true;
      setDragging(true);
      place(e);
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!active) return;
      e.preventDefault();
      place(e);
    };
    const end = () => {
      if (!active) return;
      active = false;
      setDragging(false);
      setJoystick(0, 0);
      if (knob.current) knob.current.style.transform = 'translate(0px, 0px)';
    };

    pad.addEventListener('mousedown', start);
    pad.addEventListener('touchstart', start, { passive: false });
    // Hareket ve bırakma `window`'da: imleç pedin dışına çıkınca sürükleme kopmasın.
    window.addEventListener('mousemove', move, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);
    window.addEventListener('blur', end);

    return () => {
      pad.removeEventListener('mousedown', start);
      pad.removeEventListener('touchstart', start);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
      window.removeEventListener('blur', end);
      end();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="zone-joystick"
      data-dragging={dragging}
      className="pointer-events-none absolute z-[70] flex flex-col items-center gap-1.5"
      style={{
        right: 'calc(22px + env(safe-area-inset-right))',
        bottom: 'calc(30px + env(safe-area-inset-bottom))',
      }}
    >
      <div
        ref={base}
        className="pointer-events-auto grid place-items-center rounded-full border-2 border-[color-mix(in_srgb,var(--color-fg)_60%,transparent)] bg-[color-mix(in_srgb,var(--color-bg)_40%,transparent)] backdrop-blur-[2px]"
        style={{
          width: BASE,
          height: BASE,
          touchAction: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      >
        <span
          ref={knob}
          data-testid="zone-joystick-knob"
          className="block rounded-full bg-fg shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
          style={{
            width: KNOB,
            height: KNOB,
            // Sürüklerken geçiş YOK; bırakınca merkeze yumuşak döner.
            transition: dragging || reduced ? 'none' : 'transform .12s ease-out',
          }}
        />
      </div>
      <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-fg max-md:hidden">
        Sürükle
      </span>
    </div>
  );
}
