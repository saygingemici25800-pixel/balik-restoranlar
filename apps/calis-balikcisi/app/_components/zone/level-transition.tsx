'use client';

import { useEffect, useState } from 'react';

import { getPortal } from '@/lib/zone/frames';
import { useReducedMotion } from '@/lib/zone/hooks/use-reduced-motion';
import { travelTo } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Katlar arası geçiş perdesi (merdiven). `<Canvas>` DIŞINDA, DOM.
 *
 *   travel başlar → perde kararır (220 ms) → karakter diğer kata ışınlanır, kamera yerine oturur
 *   → perde açılır (220 ms) → zone
 *
 * Işınlanma perde tam kapalıyken olur: kullanıcı sıçrama ya da kamera kayması görmez.
 * reduced-motion: perde yok, geçiş anında.
 */

const FADE_MS = 220;

export function LevelTransition() {
  const state = useZoneStore((s) => s.state);
  const travelling = useZoneStore((s) => s.travelling);
  const finishTravel = useZoneStore((s) => s.finishTravel);
  const reduced = useReducedMotion();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (state !== 'travel' || !travelling) return;
    const portal = getPortal(travelling);
    if (!portal) {
      finishTravel();
      return;
    }
    const go = () => travelTo(portal.to.level, portal.to.x, portal.to.z, portal.to.ang);
    if (reduced) {
      go();
      finishTravel();
      return;
    }
    setDark(true);
    let t2 = 0;
    const t1 = window.setTimeout(() => {
      go();
      setDark(false);
      t2 = window.setTimeout(finishTravel, FADE_MS);
    }, FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [state, travelling, reduced, finishTravel]);

  return (
    <div
      aria-hidden="true"
      data-testid="level-transition"
      className="absolute inset-0 z-[80] bg-bg transition-opacity duration-200 ease-out"
      style={{ opacity: dark ? 1 : 0, pointerEvents: state === 'travel' ? 'auto' : 'none' }}
    />
  );
}
