'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { MENU_DATA, type MenuItem } from '../_data';
import MenuVideoCard from './menu-video-card';

type Props = {
  item: MenuItem;
  eyebrow: string;
  onClose: () => void;
};

const CHAPTER_BY_EYEBROW = new Map(
  MENU_DATA.map((section, i) => [section.eyebrow, i + 1]),
);

const TOTAL_DISHES = MENU_DATA.reduce(
  (n, s) => n + s.spotlight.length + s.fullList.length,
  0,
);

const TAKE_BY_NAME = (() => {
  const map = new Map<string, number>();
  let counter = 0;
  for (const section of MENU_DATA) {
    for (const it of section.spotlight) {
      counter += 1;
      map.set(`${section.eyebrow}::${it.name}`, counter);
    }
    for (const it of section.fullList) {
      counter += 1;
      map.set(`${section.eyebrow}::${it.name}`, counter);
    }
  }
  return map;
})();

const COLOR_BARS = ['#E8B4A0', '#A04B3C', '#D4A259', '#C8DDD9'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatChapter(eyebrow: string): string {
  const idx = CHAPTER_BY_EYEBROW.get(eyebrow) ?? 0;
  return `BÖLÜM ${pad2(idx)} — ${eyebrow}`;
}

function formatTake(eyebrow: string, name: string): string {
  const idx = TAKE_BY_NAME.get(`${eyebrow}::${name}`) ?? 0;
  return `TAKE ${pad2(idx)} / ${TOTAL_DISHES}`;
}

function nowParts(): { hh: string; mm: string; ss: string } {
  const d = new Date();
  return {
    hh: pad2(d.getHours()),
    mm: pad2(d.getMinutes()),
    ss: pad2(d.getSeconds()),
  };
}

function Timecode() {
  const [parts, setParts] = useState(nowParts);

  useEffect(() => {
    const id = window.setInterval(() => {
      setParts(nowParts());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] text-accent/70 tabular-nums">
      {parts.hh}
      <span className="cinema-colon-blink mx-px">:</span>
      {parts.mm}
      <span className="cinema-colon-blink mx-px">:</span>
      {parts.ss}
    </span>
  );
}

type ColorBarsProps = {
  side: 'left' | 'right';
  hideOnMobile?: boolean;
};

function ColorBars({ side, hideOnMobile }: ColorBarsProps) {
  const order = side === 'left' ? COLOR_BARS : [...COLOR_BARS].reverse();
  const baseDelay = side === 'left' ? 0 : 320;

  return (
    <div
      aria-hidden="true"
      className={`flex flex-col gap-[2px] ${
        hideOnMobile ? 'hidden md:flex' : 'flex'
      }`}
    >
      {order.map((color, i) => (
        <span
          key={`${side}-${color}`}
          className="cinema-bar block w-[3px] flex-1"
          style={{
            backgroundColor: color,
            animationDelay: `${baseDelay + i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function MenuItemModal({ item, eyebrow, onClose }: Props) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function onScroll() {
    const top = scrollRef.current?.scrollTop ?? 0;
    setScrolled(top > 50);
  }

  const chapter = formatChapter(eyebrow);
  const take = formatTake(eyebrow, item.name);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6"
      style={{
        background:
          'linear-gradient(135deg, rgba(8,23,31,0.95) 0%, rgba(16,44,61,0.95) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #08171F 0%, #102C3D 100%)',
        }}
      >
        <div
          className={`cinema-letterbox-top sticky top-0 z-10 w-full flex items-center justify-between px-4 md:px-10 transition-colors duration-200 ${
            scrolled ? 'bg-[#0B1E2A]/95' : 'bg-[#0B1E2A]'
          }`}
          style={{ height: 'clamp(48px, 7vh, 96px)' }}
        >
          <span className="font-mono text-[9px] md:text-[11px] tracking-[0.4em] uppercase text-accent/70 truncate">
            {chapter}
          </span>
          <Timecode />
        </div>

        <div className="cinema-panel flex-1 flex items-stretch px-4 md:px-10 py-6 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 w-full items-center">
            <div className="md:col-span-5 flex flex-col justify-center order-2 md:order-1">
              <p
                className="cinema-text font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-accent/80"
                style={{ animationDelay: '650ms' }}
              >
                {eyebrow}
              </p>

              <h2
                id={titleId}
                className="cinema-text font-fraunces italic mt-4 md:mt-6 text-fg leading-[1.05]"
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
                  letterSpacing: '0.02em',
                  fontVariationSettings: '"opsz" 144, "wght" 400',
                  textShadow: '0 0 30px rgba(212, 162, 89, 0.15)',
                  animationDelay: '750ms',
                }}
              >
                {item.name}
              </h2>

              {item.description ? (
                <p
                  className="cinema-text font-display italic mt-3 md:mt-4 text-fg/70 text-base md:text-lg leading-snug"
                  style={{ animationDelay: '850ms' }}
                >
                  {item.description}
                </p>
              ) : null}

              {item.longDescription ? (
                <p
                  className="cinema-text font-reader mt-6 md:mt-8 text-fg/65 leading-[1.7] text-[0.95rem]"
                  style={{
                    maxWidth: '32ch',
                    animationDelay: '950ms',
                  }}
                >
                  {item.longDescription}
                </p>
              ) : null}

              <p
                className="cinema-text hidden md:block font-mono text-[10px] tracking-[0.4em] uppercase text-fg/40 mt-10"
                style={{ animationDelay: '1050ms' }}
              >
                TEZGAH — GÜNLÜK
              </p>
            </div>

            <div className="md:col-span-7 order-1 md:order-2">
              <div className="flex items-stretch gap-2 md:gap-3 w-full">
                <ColorBars side="left" hideOnMobile />
                <div className="flex-1 relative overflow-hidden aspect-[16/9] md:aspect-[235/100]">
                  {item.videoUrl ? (
                    <MenuVideoCard
                      video={item.videoUrl}
                      poster={item.photoUrl}
                      title={item.name}
                      className="mvc-fill"
                    />
                  ) : item.photoUrl ? (
                    <Image
                      src={item.photoUrl}
                      alt={item.name}
                      fill
                      sizes="(min-width: 768px) 60rem, 95vw"
                      className="cinema-photo object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="cinema-photo cinema-fallback absolute inset-0"
                    />
                  )}
                  <style>{`
                    .mvc.mvc-fill {
                      position: absolute; inset: 0;
                      aspect-ratio: auto; height: 100%;
                      border-radius: 0;
                    }
                  `}</style>
                </div>
                <ColorBars side="right" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="cinema-letterbox-bottom sticky bottom-0 z-10 w-full bg-[#0B1E2A] flex items-center justify-between px-4 md:px-10"
          style={{ height: 'clamp(48px, 7vh, 96px)' }}
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="font-mono text-[10px] md:text-[12px] tracking-[0.5em] uppercase text-accent/70 hover:text-accent transition-colors"
          >
            FIN ⏎
          </button>
          <span
            aria-hidden="true"
            className="font-mono text-[9px] md:text-[11px] tracking-[0.4em] uppercase text-accent/50"
          >
            {take}
          </span>
        </div>
      </div>
    </div>
  );
}
