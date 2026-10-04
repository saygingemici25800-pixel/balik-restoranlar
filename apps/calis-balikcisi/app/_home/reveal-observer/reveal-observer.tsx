'use client';

import { useEffect } from 'react';

/**
 * Tek gözlemci: `[data-reveal]` öğeleri görünüme girince bir kez `data-shown` alır (CSS geçişi
 * başlar). Hareket azaltılmışsa hiç çalışmaz — her şey baştan görünür. Görünümde olanlar
 * gizlenmeden işaretlenir: ilk boyamada yanıp sönme olmaz. JS yoksa da her şey görünür.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.querySelector<HTMLElement>('[data-home]');
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const vh = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) el.setAttribute('data-shown', '');
    }
    root.setAttribute('data-motion', 'on');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute('data-shown', '');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );
    for (const el of items) if (!el.hasAttribute('data-shown')) io.observe(el);
    return () => io.disconnect();
  }, []);
  return null;
}
