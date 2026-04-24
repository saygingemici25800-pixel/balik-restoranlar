'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SiteTopBar } from './top-bar';

const HERO_IMAGES: { src: string; alt: string }[] = [
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
];

const INTERVAL_MS = 5000;

export function CalisHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden text-fg">
      <div className="absolute inset-0">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 motion-safe:transition-opacity motion-safe:duration-1000"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
            aria-hidden={i !== activeIndex}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/30 to-bg/70"
        aria-hidden="true"
      />

      <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="text-xs uppercase tracking-[0.4em] text-accent mb-8">
          Fethiye, Türkiye
        </p>
        <h1 className="font-display text-6xl md:text-8xl leading-[1.05] text-fg">
          A Table by the Sea
        </h1>
        <p className="mt-8 max-w-xl text-fg/80 leading-relaxed">
          Where the Aegean meets the Mediterranean. We honor the daily catch with minimalist precision and elemental fire.
        </p>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-fg/60"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
