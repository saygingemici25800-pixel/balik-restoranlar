'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import type { HeroKind } from '@/lib/zone/figure';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Zone'a girmeden karakter seçimi: balıkçı ya da etekli kız. Sahne bu sırada arkada kurulur; seçim
 * yapılınca (sahne hazırsa hemen) Zone başlar. `three` import ETMEZ; önizlemeler sahnedeki 3B
 * gövdenin toon çizimi (şeffaf PNG, `public/images/zone`), yazı yerine cinsiyet simgesi.
 */

const CHOICES: readonly { kind: HeroKind; label: string }[] = [
  { kind: 'erkek', label: 'Erkek' },
  { kind: 'kiz', label: 'Kız' },
];

/** ♂ halka + sağ üste ok · ♀ halka + altta artı (çizgi, 24 birimlik kutu). */
function Glyph({ kind }: { kind: HeroKind }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-bg"
    >
      {kind === 'erkek' ? (
        <>
          <circle cx="9.5" cy="14.5" r="5.5" />
          <path d="M13.4 10.6 20 4M14.5 4H20v5.5" />
        </>
      ) : (
        <>
          <circle cx="12" cy="9" r="5.5" />
          <path d="M12 14.5V21M8.8 18h6.4" />
        </>
      )}
    </svg>
  );
}

export function HeroChoice({ progress }: { progress: number }) {
  const choose = useZoneStore((s) => s.choose);
  const first = useRef<HTMLButtonElement>(null);

  // Perde açılınca odağı kendine alır (aynı karede); seçim düğmesi ondan SONRA odaklanır.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => first.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-7 px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Zone · 3B teras</p>
        <h2 className="mt-2 font-display text-4xl text-fg md:text-5xl">Kiminle gezeceksin?</h2>
      </div>
      <div className="flex gap-4 md:gap-6">
        {CHOICES.map((c, i) => (
          <button
            key={c.kind}
            ref={i === 0 ? first : undefined}
            type="button"
            onClick={() => choose(c.kind)}
            data-testid={`zone-hero-${c.kind}`}
            aria-label={`${c.label} karakterle gir`}
            className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-fg/20 bg-fg px-4 pb-4 pt-3 text-bg transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <Image
              src={`/images/zone/hero-${c.kind}.png`}
              alt=""
              width={720}
              height={1040}
              sizes="(min-width: 768px) 125px, 104px"
              loading="eager"
              className="h-[150px] w-[104px] transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none md:h-[180px] md:w-[125px]"
            />
            <Glyph kind={c.kind} />
          </button>
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.24em] text-fg/70">
        {progress < 100 ? `Teras hazırlanıyor · ${Math.round(progress)}%` : 'Teras hazır'}
      </p>
    </div>
  );
}
