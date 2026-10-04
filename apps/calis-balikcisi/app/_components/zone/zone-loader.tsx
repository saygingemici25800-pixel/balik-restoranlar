'use client';

import { useEffect, useState } from 'react';

import { useZoneStore } from '@/lib/zone/store';
import { HeroChoice } from './hero-choice';

/**
 * Yükleyici (docs/zone-3d-modul.md bölüm 2): yüzde ve dönen kısa mesajlar. Yüzde sahte sayaç
 * değil — kapı açılınca 15, sahne chunk'ı inince 70, sahne GERÇEKTEN kurulunca 100 (`ready`).
 * Önce karakter seçimi sorulur (`HeroChoice`); sahne arkada kurulmaya devam eder. `three` import
 * ETMEZ.
 */

const MESSAGES = ['Masalar kuruluyor…', 'Gün batımı ayarlanıyor…', 'Reyon diziliyor…'] as const;

export function ZoneLoader() {
  const state = useZoneStore((s) => s.state);
  const progress = useZoneStore((s) => s.progress);
  const chosen = useZoneStore((s) => s.chosen);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (state !== 'loading') return;
    const id = window.setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 1400);
    return () => window.clearInterval(id);
  }, [state]);

  if (state !== 'loading') return null;
  if (!chosen) {
    return (
      <div className="absolute inset-0 z-[85] grid place-items-center overflow-y-auto bg-bg py-20">
        <HeroChoice progress={progress} />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 z-[85] grid place-items-center bg-bg" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-display text-5xl text-fg" data-testid="zone-progress">
          {Math.round(progress)}%
        </p>
        <p className="text-sm uppercase tracking-[0.24em] text-accent">{MESSAGES[i]}</p>
      </div>
    </div>
  );
}
