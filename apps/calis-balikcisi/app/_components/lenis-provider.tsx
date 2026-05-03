'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

const NO_SMOOTH_SCROLL_PATHS: ReadonlyArray<string> = ['/rezervasyon'];

type Props = {
  children: ReactNode;
};

export function LenisProvider({ children }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (
      pathname &&
      NO_SMOOTH_SCROLL_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      )
    ) {
      return;
    }

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    let rafId = 0;
    function raf(time: number) {
      lenisInstance?.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, [pathname]);

  return <>{children}</>;
}
