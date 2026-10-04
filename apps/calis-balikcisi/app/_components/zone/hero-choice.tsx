'use client';

import { useEffect, useRef } from 'react';

import type { HeroKind } from '@/lib/zone/figure';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Zone'a girmeden karakter seçimi: "Erkek / Kız". Sahne bu sırada arkada kurulur; seçim yapılınca
 * (sahne hazırsa hemen) Zone başlar. `three` import ETMEZ; önizleme çizimi (`figure`) kapı
 * açılınca ayrı chunk olarak iner, ana sayfa bundle'ına girmez.
 */

const CHOICES: readonly { kind: HeroKind; label: string; note: string }[] = [
  { kind: 'erkek', label: 'Erkek', note: 'kasketli balıkçı' },
  { kind: 'kiz', label: 'Kız', note: 'etekli, saç bantlı' },
];

const W = 220;
const H = 280;

function HeroPreview({ kind }: { kind: HeroKind }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true;
    void Promise.all([import('@/lib/zone/figure'), import('@/lib/zone/brand')]).then(([fig, brand]) => {
      const x = canvas.current?.getContext('2d');
      if (alive && x) fig.drawFigure(x, 'front', brand.readBrand(), W, H, kind);
    })
      // chunk inmezse önizleme boş kalır; düğmenin adı ve notu seçimi yine anlatır
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [kind]);
  return <canvas ref={canvas} width={W} height={H} aria-hidden="true" className="h-[140px] w-[110px] md:h-[168px] md:w-[132px]" />;
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
            aria-label={`${c.label} karakterle gir — ${c.note}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-fg/20 bg-fg px-4 pb-4 pt-3 text-bg transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <HeroPreview kind={c.kind} />
            <span className="text-lg font-semibold uppercase tracking-[0.16em]">{c.label}</span>
            <span className="text-xs text-bg/75">{c.note}</span>
          </button>
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.24em] text-fg/70">
        {progress < 100 ? `Teras hazırlanıyor · ${Math.round(progress)}%` : 'Teras hazır'}
      </p>
    </div>
  );
}
