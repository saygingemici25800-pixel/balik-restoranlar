'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';

import { BOARD_CONTENT } from '@/lib/zone/board-content';
import { getFrame } from '@/lib/zone/frames';
import { useZoneStore } from '@/lib/zone/store';
import { StoryBoard } from './story-board';

/**
 * POV pano kartı (docs/zone-3d-modul.md bölüm 7.4).
 *
 * **Tam ekran DEĞİL:** ortada kart; kenarlarda 3D sahne görünür — kullanıcı Zone'dan çıkmadığını
 * görsün. `<Canvas>` DIŞINDA, normal DOM: kaydırma, odak ve klavye doğru çalışır.
 *
 * Odak (bölüm 12): açılınca karta (`preventScroll` — sayfa kaymaz), kapanınca panoyu açan GİR
 * düğmesine (`returnFocus`, `FramePrompt` tamamlar). Tab kartın içinde döner (`aria-modal`).
 * Esc global kontrolde (`use-zone-controls`): POV'dan çıkar.
 */

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function FrameBoard() {
  const state = useZoneStore((s) => s.state);
  const pov = useZoneStore((s) => s.pov);
  const closeFrame = useZoneStore((s) => s.closeFrame);
  const card = useRef<HTMLDivElement>(null);

  const open = state === 'pov' && pov !== null;

  useEffect(() => {
    if (open) card.current?.focus({ preventScroll: true });
  }, [open, pov]);

  /**
   * Odak kartın DIŞINA çıkamaz (aria-modal). Kartın `onKeyDown` tuzağı yalnız odak kartın içindeyken
   * çalışır; sahneye tıklanınca odak `body`'ye düşüyor, Shift+Tab perdenin arkasındaki görünmez
   * site bağlantılarına gidiyordu (Faz 3 incelemesi). Belge düzeyinde: dışarıda odaklanan öğe olursa
   * ya da odak hiçbir yere gitmezse kart geri alır.
   */
  useEffect(() => {
    const el = card.current;
    if (!open || !el) return;
    const keepInside = (e: FocusEvent) => {
      const t = e.target;
      if (t instanceof Node && !el.contains(t)) el.focus({ preventScroll: true });
    };
    const onOut = (e: FocusEvent) => {
      if (e.relatedTarget) return;
      requestAnimationFrame(() => {
        if (document.activeElement === document.body) el.focus({ preventScroll: true });
      });
    };
    document.addEventListener('focusin', keepInside);
    el.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', keepInside);
      el.removeEventListener('focusout', onOut);
    };
  }, [open, pov]);

  if (!open) return null;
  const frame = getFrame(pov);
  if (!frame) return null;
  const titleId = `zone-board-title-${frame.id}`;

  /** Odak tuzağı: Tab son öğeden ilke, Shift+Tab ilkten sona döner. */
  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !card.current) return;
    const items = Array.from(card.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const firstEl = items[0];
    const lastEl = items[items.length - 1];
    if (!firstEl || !lastEl) return;
    if (e.shiftKey && (document.activeElement === firstEl || document.activeElement === card.current)) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[75] grid place-items-center p-4 md:p-8">
      <div
        ref={card}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="frame-board"
        data-frame={frame.id}
        onKeyDown={trap}
        className="pointer-events-auto flex max-h-[min(86vh,900px)] w-[min(92vw,720px)] flex-col overflow-y-auto rounded-sm border border-accent/40 bg-bg text-fg shadow-[0_40px_90px_rgba(0,0,0,0.55)] outline-none motion-safe:animate-zone-board-in"
      >
        {/* yapışkan üst şerit — kart kaydırılsa da başlık ve geri görünür kalır */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-fg/10 bg-bg px-5 py-4 md:px-7">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-accent">{frame.kicker}</p>
            {/* Sarar, kesilmez: 320 px'te de başlık tam okunur (WCAG 1.4.10). */}
            <h2 id={titleId} className="break-words font-display text-2xl leading-tight text-fg sm:text-3xl md:text-4xl">
              {frame.title}
            </h2>
          </div>
          <button
            type="button"
            data-testid="frame-board-back"
            onClick={closeFrame}
            className="shrink-0 rounded-full border border-fg/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            ← Geri
          </button>
        </div>
        <div className="px-5 py-6 md:px-7 md:py-8">
          <StoryBoard content={BOARD_CONTENT[frame.id]} />
        </div>
      </div>
    </div>
  );
}
