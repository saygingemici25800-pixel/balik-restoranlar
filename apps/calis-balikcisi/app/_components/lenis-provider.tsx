'use client';

import Lenis from 'lenis';
import { useEffect, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function LenisProvider({ children }: Props) {
  useEffect(() => {
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let lenis: Lenis | null = null;
    let frameId: number | null = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        frameId = requestAnimationFrame(raf);
      };
      frameId = requestAnimationFrame(raf);
    };

    const stop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      lenis?.destroy();
      lenis = null;
    };

    if (!reduceMotionQuery.matches) start();

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) stop();
      else start();
    };

    reduceMotionQuery.addEventListener('change', handleChange);

    return () => {
      reduceMotionQuery.removeEventListener('change', handleChange);
      stop();
    };
  }, []);

  return <>{children}</>;
}
