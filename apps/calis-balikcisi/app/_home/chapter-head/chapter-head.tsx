import type { ReactNode } from 'react';

import h from '../home.module.css';
import { HandNote } from '../hand-note';

/**
 * Bölüm başı: "01 — SOFRA" etiketi + 1 px ufuk çizgisi (başında 48 px güneş parçası). Çizgi
 * görünüme girince soldan çizilir (M5). İmza öğe: her bölümde bir kez.
 */
type ChapterHeadProps = { no: string; label: string; note?: string; aside?: ReactNode };

export function ChapterHead({ no, label, note, aside }: ChapterHeadProps) {
  return (
    <div className={h.chapter}>
      <div className={h.chapterRow}>
        <p className={h.label} data-reveal="rise">
          <span className={h.sun}>{no}</span> — {label}
        </p>
        {note ? <HandNote className="hidden md:inline-flex">{note}</HandNote> : null}
        {aside}
      </div>
      <div className={h.rule} data-reveal="rule" aria-hidden="true" />
    </div>
  );
}
