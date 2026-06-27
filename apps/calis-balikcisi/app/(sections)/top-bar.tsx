'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MenuDrawer } from './menu-drawer';
import { RES_ENABLED } from '@/lib/flags';

type Props = {
  className?: string;
};

export function SiteTopBar({ className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  return (
    <>
      <header
        className={`px-3 md:px-8 py-2 md:py-3 grid grid-cols-3 items-center gap-2 ${className}`}
      >
        <button
          id="hamburger-icon"
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-controls="menu-drawer"
          aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          className="group justify-self-start -ml-2 p-2 text-fg hover:text-accent transition-colors"
        >
          <svg
            className="pointer-events-none h-5 w-5 md:h-6 md:w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path
              d="M4 12L20 12"
              className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
            />
            <path
              d="M4 12H20"
              className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
            />
            <path
              d="M4 12H20"
              className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
            />
          </svg>
        </button>

        <Link
          href="/"
          aria-label="Çalış Balıkçısı — Anasayfa"
          className="justify-self-center"
        >
          <span className="m-0 font-display italic font-normal text-fg text-[0.95rem] md:text-[1.4rem] tracking-[0.02em] whitespace-nowrap">
            Çalış Balıkçısı
          </span>
        </Link>

        {RES_ENABLED && (
          <Link
            href="/rezervasyon"
            className="relative inline-block justify-self-end pb-1"
          >
            <span className="text-[0.6rem] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.3em] text-accent whitespace-nowrap font-light">
              Rezervasyon
            </span>
            <span
              aria-hidden="true"
              className="absolute left-0 bottom-0 h-px w-full bg-accent"
            />
          </Link>
        )}
      </header>

      <MenuDrawer isOpen={isOpen} />
    </>
  );
}
