'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  isOpen: boolean;
};

const links = [
  { href: '/#bugun-tezgahta', label: 'Taze Taze' },
  { href: '/menu', label: 'Sofra' },
  { href: '/rezervasyon', label: 'Rezervasyon' },
  { href: '/iletisim', label: 'Konuşalım' },
];

export function MenuDrawer({ isOpen }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      id="menu-drawer"
      aria-label="Ana menü"
      tabIndex={-1}
      className="fixed top-0 left-0 z-30 px-6 md:px-8 lg:px-10 pt-20 md:pt-28 flex flex-col gap-3 md:gap-4 pointer-events-none"
    >
      {links.map((link, i) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            tabIndex={isOpen ? 0 : -1}
            aria-hidden={!isOpen}
            className={`font-display font-bold tracking-[-0.01em] text-lg md:text-xl lg:text-2xl transition-all duration-700 ease-out ${
              active ? 'text-accent' : 'text-fg hover:text-accent'
            } ${
              isOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
            style={{ transitionDelay: isOpen ? `${i * 150}ms` : '0ms' }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
