'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LenisProvider } from './lenis-provider';
import { ScrollProgress } from './scroll-progress';
import { ScrollToTop } from './scroll-to-top';

type SiteChromeProps = {
  children: ReactNode;
  footer: ReactNode;
};

// Site chrome'u (smooth scroll, scroll göstergesi, footer, yukarı dön) sarar.
// /admin altında yalnız sayfa içeriği render edilir.
export function SiteChrome({ children, footer }: SiteChromeProps) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return <>{children}</>;

  return (
    <LenisProvider>
      <ScrollProgress />
      {children}
      {footer}
      <ScrollToTop />
    </LenisProvider>
  );
}
