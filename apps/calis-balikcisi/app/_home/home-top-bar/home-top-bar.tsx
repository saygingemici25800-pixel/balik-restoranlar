'use client';

import { Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { CONTACT } from '@/lib/constants';
import h from '../home.module.css';
import { HomeMenuSheet } from './home-menu-sheet';
import s from './home-top-bar.module.css';

/**
 * Ana sayfa üst çubuğu (yalnız ana sayfa; diğer sayfalar SiteTopBar). Filmin üstünde saydam:
 * gerçek logo, geniş ekranda Menü · İletişim + telefon; telefon/tablette "Ara" + menü düğmesi →
 * tam ekran menü sayfası.
 */
export function HomeTopBar() {
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  const close = () => {
    setOpen(false);
    burger.current?.focus({ preventScroll: true });
  };

  return (
    <header className={s.bar}>
      <div className={`${h.wrap} ${s.row}`}>
        <Link href="/" aria-label="Çalış Balıkçısı — Anasayfa" className={s.brand}>
          <Image src="/images/calis-logo-light.svg" alt="" width={296} height={75} priority unoptimized className={s.logo} />
        </Link>
        <div className={s.tools}>
          <nav aria-label="Ana menü" className={s.nav}>
            <Link href="/menu" className={s.navLink}>Menü</Link>
            <Link href="/iletisim" className={s.navLink}>İletişim</Link>
          </nav>
          <a href={CONTACT.mobileHref} aria-label={`Telefonla ara: ${CONTACT.mobile}`} className={s.call}>
            <Phone aria-hidden="true" strokeWidth={1.75} />
            <span className={s.callText}>
              <span className={s.callShort}>Ara</span>
              <span className={s.callLong}>{CONTACT.mobile}</span>
            </span>
          </a>
          <span aria-hidden="true" className={`${s.sep} ${s.mobileOnly}`} />
          <button
            ref={burger}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label="Site menüsünü aç"
            className={s.burger}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M3 9h18M9 15h12" />
            </svg>
          </button>
        </div>
      </div>
      {open ? <HomeMenuSheet onClose={close} /> : null}
    </header>
  );
}
