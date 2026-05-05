'use client';

import { Fragment, useEffect, useState } from 'react';
import { getLenis } from '../../_components/lenis-provider';
import { MENU_DATA, type MenuItem, type MenuSection } from '../_data';

type Props = {
  onItemClick: (item: MenuItem, eyebrow: string) => void;
};

const FLOW_SIZES = [
  'text-sm',
  'text-base',
  'text-sm',
  'text-xl italic',
  'text-base',
  'text-sm',
  'text-xl italic',
];

function computeScrollTarget(
  targetId: string,
  closingId: string | null,
): number | null {
  const header = document.getElementById(`header-${targetId}`);
  if (!header) return null;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const topBarH = isMobile ? 70 : 100;
  const currentY =
    window.scrollY + header.getBoundingClientRect().top - topBarH;

  let shift = 0;
  if (closingId !== null && closingId !== targetId) {
    const closingIdx = MENU_DATA.findIndex((s) => s.id === closingId);
    const targetIdx = MENU_DATA.findIndex((s) => s.id === targetId);
    if (closingIdx >= 0 && targetIdx >= 0 && closingIdx < targetIdx) {
      const panel = document.getElementById(`panel-${closingId}`);
      const inner = panel?.firstElementChild as HTMLElement | null;
      const closingHeight = inner?.scrollHeight ?? panel?.offsetHeight ?? 0;
      shift = -closingHeight;
    }
  }

  return Math.max(0, currentY + shift);
}

function runScroll(targetY: number, reduceMotion: boolean) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(targetY, { duration: 0.6, immediate: reduceMotion });
    return;
  }
  window.scrollTo({
    top: targetY,
    behavior: reduceMotion ? 'auto' : 'smooth',
  });
}

export function MenuAccordion({ onItemClick }: Props) {
  const [openId, setOpenId] = useState<string | null>('corba');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    MENU_DATA.forEach((category) => {
      category.spotlight.forEach((item) => {
        if (!item.photoUrl) return;
        const img = new window.Image();
        img.src = item.photoUrl;
      });
    });
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash || !MENU_DATA.some((s) => s.id === hash)) return;

    const targetY = computeScrollTarget(hash, 'corba');
    setOpenId(hash);

    if (targetY !== null) {
      requestAnimationFrame(() => runScroll(targetY, reduceMotion));
    }
    // mount-only: openId default 'corba' kullanılır, reduceMotion mount snapshot'ı
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle(id: string) {
    const isOpening = openId !== id;

    if (!isOpening) {
      setOpenId(null);
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    const targetY = computeScrollTarget(id, openId);

    setOpenId(id);
    history.replaceState(null, '', `#${id}`);

    if (targetY !== null) {
      runScroll(targetY, reduceMotion);
    }
  }

  return (
    <section className="px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        {MENU_DATA.map((section, i) => (
          <Row
            key={section.id}
            section={section}
            isOpen={openId === section.id}
            isLast={i === MENU_DATA.length - 1}
            reduceMotion={reduceMotion}
            onToggle={() => handleToggle(section.id)}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </section>
  );
}

type RowProps = {
  section: MenuSection;
  isOpen: boolean;
  isLast: boolean;
  reduceMotion: boolean;
  onToggle: () => void;
  onItemClick: (item: MenuItem, eyebrow: string) => void;
};

function Row({
  section,
  isOpen,
  isLast,
  reduceMotion,
  onToggle,
  onItemClick,
}: RowProps) {
  const totalCount = section.spotlight.length + section.fullList.length;
  const headerId = `header-${section.id}`;
  const panelId = `panel-${section.id}`;

  return (
    <div
      id={`category-${section.id}`}
      className={`border-t border-fg/10 ${isLast ? 'border-b' : ''}`}
    >
      <button
        id={headerId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group w-full flex items-baseline justify-between py-7 px-2 text-left"
      >
        <span className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-fg/40">
            {section.eyebrow}
          </span>
          <span
            className={`font-display italic text-2xl mt-2 transition-colors ${
              isOpen ? 'text-accent' : 'text-fg group-hover:text-accent'
            }`}
          >
            {section.title}
          </span>
        </span>
        <span className="flex items-center gap-6 shrink-0">
          <span className="text-xs text-fg/45 tracking-wider">
            {totalCount}
          </span>
          <span
            aria-hidden="true"
            className={`text-accent text-[22px] inline-block leading-none ${
              reduceMotion ? '' : 'transition-transform duration-[400ms] ease'
            }`}
            style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
          >
            +
          </span>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!isOpen}
        className={`grid ${
          reduceMotion ? '' : 'transition-[grid-template-rows] duration-500 ease'
        }`}
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <Panel section={section} onItemClick={onItemClick} />
        </div>
      </div>
    </div>
  );
}

type PanelProps = {
  section: MenuSection;
  onItemClick: (item: MenuItem, eyebrow: string) => void;
};

function Panel({ section, onItemClick }: PanelProps) {
  const spotlightCols =
    section.spotlight.length <= 2
      ? 'md:grid-cols-2'
      : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="px-2 pb-14 pt-4">
      {section.priceNote ? (
        <p className="font-display italic text-center text-fg/55 text-sm md:text-[0.95rem] tracking-[0.02em] mt-2 mb-8">
          {section.priceNote}
        </p>
      ) : null}

      <div className={`grid grid-cols-1 ${spotlightCols} gap-y-10 gap-x-8`}>
        {section.spotlight.map((item) => (
          <div key={item.name} className="text-center">
            <button
              type="button"
              onClick={() => onItemClick(item, section.eyebrow)}
              className="font-display italic text-xl md:text-2xl text-fg hover:text-accent transition-colors"
            >
              {item.name}
            </button>
            {item.description ? (
              <p className="mt-3 max-w-xs mx-auto text-sm text-fg/55 leading-relaxed">
                {item.description}
              </p>
            ) : null}
            {item.priceRange ? (
              <p className="mt-2 text-sm tracking-[0.02em] text-accent/85">
                {item.priceRange}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {section.fullList.length > 0 ? (
        <div className="mt-12 pt-8 border-t border-fg/10">
          <p className="text-[10px] tracking-[0.45em] text-fg/35 uppercase text-center mb-6">
            {section.listLabel}
          </p>
          <div
            className="text-center font-display"
            style={{ lineHeight: 2.4 }}
          >
            {section.fullList.map((item, i) => (
              <Fragment key={item.name}>
                <button
                  type="button"
                  onClick={() => onItemClick(item, section.eyebrow)}
                  className={`inline-block mx-2 text-fg/85 hover:text-accent border-b border-transparent hover:border-accent transition-colors ${FLOW_SIZES[i % FLOW_SIZES.length]}`}
                >
                  {item.name}
                  {item.priceRange ? (
                    <span className="ml-2 text-xs not-italic text-accent/70 tracking-[0.02em] align-middle">
                      {item.priceRange}
                    </span>
                  ) : null}
                </button>
                {i < section.fullList.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="text-accent/35 text-xs mx-1"
                  >
                    ·
                  </span>
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
