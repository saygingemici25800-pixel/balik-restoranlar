'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HERO_IMAGES: { src: string; alt: string }[] = [
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
  { src: '/images/calis-hero.png', alt: 'Çalış Balıkçısı — deniz manzarası' },
];

const INTERVAL_MS = 5000;

const NAV_LINKS: { id: string; label: string; href: string }[] = [
  { id: 'menu', label: 'Menü', href: '#menu' },
  { id: 'konsept', label: 'Konsept', href: '#konsept' },
  { id: 'bugun-tezgahta', label: 'Bugün Tezgâhta', href: '#bugun-tezgahta' },
  { id: 'iletisim', label: 'İletişim', href: '#iletisim' },
  { id: 'rezervasyon', label: 'Masa Ayırt', href: '/rezervasyon' },
];

export function CalisHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeId, setActiveId] = useState('menu');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.filter((link) => link.href.startsWith('#'))
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
        className="absolute inset-0 bg-gradient-to-b from-bg/50 via-bg/10 to-bg/50"
        aria-hidden="true"
      />

      <header className="fixed top-0 left-0 right-0 z-20 px-10 md:px-16 py-6 grid grid-cols-3 items-center">
        <Link
          href="/rezervasyon"
          className="group relative inline-block justify-self-start pb-1"
        >
          <span className="text-sm uppercase tracking-widest text-fg opacity-80">
            Rezervasyon
          </span>
          <span
            aria-hidden="true"
            className="absolute left-0 bottom-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
        </Link>
        <Link
          href="/"
          className="font-display text-xl uppercase text-fg tracking-[0.25em] justify-self-center"
        >
          Çalış Balıkçısı
        </Link>
        <div aria-hidden="true" />
      </header>

      <nav
        aria-label="Bölümler"
        className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-12"
      >
        {NAV_LINKS.map((link) => {
          const isActive = activeId === link.id;
          return (
            <Link
              key={link.id}
              href={link.href}
              aria-current={isActive ? 'true' : undefined}
              className="group flex items-center gap-3"
            >
              <span
                className={`text-xs uppercase tracking-widest transition-colors ${
                  isActive ? 'text-accent' : 'text-fg/50 group-hover:text-fg/80'
                }`}
              >
                {link.label}
              </span>
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  isActive ? 'bg-accent' : 'border border-fg/30'
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
