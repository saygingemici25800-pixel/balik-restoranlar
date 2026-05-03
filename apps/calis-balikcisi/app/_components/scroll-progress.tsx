'use client';

import { useEffect, useState } from 'react';
import { getLenis } from './lenis-provider';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanup: (() => void) | null = null;

    function computeFromWindow(): number {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      const pct = (window.scrollY / max) * 100;
      return Math.max(0, Math.min(100, pct));
    }

    function attachWindow() {
      const update = () => setProgress(computeFromWindow());
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      };
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', update);
      cleanup = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', update);
      };
    }

    function attachLenis(): boolean {
      const lenis = getLenis();
      if (!lenis) return false;
      const update = () => {
        const limit = lenis.limit;
        if (!limit || limit <= 0) {
          setProgress(0);
          return;
        }
        const pct = (lenis.scroll / limit) * 100;
        setProgress(Math.max(0, Math.min(100, pct)));
      };
      const onScroll = () => update();
      lenis.on('scroll', onScroll);
      window.addEventListener('resize', update);
      update();
      cleanup = () => {
        lenis.off('scroll', onScroll);
        window.removeEventListener('resize', update);
      };
      return true;
    }

    if (!attachLenis()) {
      const rafId = requestAnimationFrame(() => {
        if (!attachLenis()) attachWindow();
      });
      return () => {
        cancelAnimationFrame(rafId);
        cleanup?.();
      };
    }

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div className="scroll-progress-track" aria-hidden="true">
      <div className="scroll-progress-fill" style={{ height: `${progress}%` }} />
    </div>
  );
}
