import type { ReactNode } from 'react';

import h from '../home.module.css';

/**
 * El notu: Kalam 700, aksan renginde, hafif eğik — mekânın "kendi eliyle" yazdığı not.
 * İsteğe bağlı statik çizgi (canlanmaz). Bölüm başına en fazla bir tane.
 */
type HandNoteProps = { children: ReactNode; shape?: 'underline' | 'arrow'; className?: string };

const PATHS = {
  underline: { box: '0 0 220 12', d: 'M2 8 C40 3 90 11 140 5 S200 7 218 4', w: 160, h: 10 },
  arrow: { box: '0 0 100 48', d: 'M4 4 C30 20 60 34 92 38 M80 30 L92 38 L80 44', w: 64, h: 30 },
} as const;

export function HandNote({ children, shape, className = '' }: HandNoteProps) {
  const p = shape ? PATHS[shape] : null;
  return (
    <span className={`${h.note} inline-flex flex-col ${className}`}>
      <span>{children}</span>
      {p ? (
        <svg viewBox={p.box} width={p.w} height={p.h} fill="none" aria-hidden="true" className="mt-1">
          <path d={p.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : null}
    </span>
  );
}
