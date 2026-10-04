'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { CONTACT_INFO } from '@/app/iletisim/_data';
import { CONTACT } from '@/lib/constants';
import { lockScroll, unlockScroll } from '@/lib/scroll-lock';
import h from '../home.module.css';
import s from './home-top-bar.module.css';

const WHATSAPP = `${CONTACT.whatsapp}?text=${encodeURIComponent('Merhaba, Çalış Balıkçısı hakkında bilgi almak istiyorum.')}`;
const LINKS = [
  { no: '01', href: '/menu', label: 'Menü' },
  { no: '02', href: '/iletisim', label: 'İletişim' },
] as const;
const FOCUSABLE = 'a[href], button:not([disabled])';

/** Tam ekran menü sayfası (telefon/tablet): odak içinde döner, Esc kapatır, sayfa kaymaz. */
export function HomeMenuSheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const hours = CONTACT_INFO.openingHours[0];

  useEffect(() => {
    lockScroll();
    ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [onClose]);

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Site menüsü" className={s.sheet} data-lenis-prevent="">
      <div className={`${h.wrap} ${s.row}`}>
        <Link href="/" aria-label="Çalış Balıkçısı — Anasayfa" className={s.brand} onClick={onClose}>
          <Image src="/images/calis-logo-light.svg" alt="" width={296} height={75} unoptimized className={s.logo} />
        </Link>
        <button type="button" onClick={onClose} aria-label="Menüyü kapat" className={s.burger} style={{ display: 'grid', marginInlineEnd: -12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>
      <nav aria-label="Ana menü" className={`${h.wrap} ${s.sheetNav}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={s.sheetLink} onClick={onClose}>
            <span aria-hidden="true" className={s.sheetNo}>{l.no}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className={`${h.wrap} ${s.sheetFoot}`}>
        {hours ? <span className={s.sheetMeta}>{`${hours.days} ${hours.hours}`}</span> : null}
        <a href={CONTACT.mobileHref} className={s.sheetAction}>{CONTACT.mobile}</a>
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={s.sheetAction}>
          WhatsApp<span className="sr-only"> (yeni sekmede açılır)</span>
        </a>
      </div>
    </div>
  );
}
