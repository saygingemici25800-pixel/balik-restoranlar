'use client';

import { useRef, useState } from 'react';
import { SiteTopBar } from '../(sections)/top-bar';
import { SiteFooter } from '../(sections)/footer';
import {
  GALLERY_DATA,
  type GalleryItem,
  type GallerySection as GallerySectionData,
} from './_data';
import { VideoHero } from './_components/video-hero';
import { GallerySection } from './_components/gallery-section';
import { GalleryItemModal } from './_components/gallery-item-modal';

type Active = { item: GalleryItem; section: GallerySectionData } | null;

export default function GaleriPage() {
  const [active, setActive] = useState<Active>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function open(
    item: GalleryItem,
    section: GallerySectionData,
    trigger: HTMLElement,
  ) {
    triggerRef.current = trigger;
    setActive({ item, section });
  }

  function close() {
    setActive(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    trigger?.focus();
  }

  return (
    <>
      <main>
        <SiteTopBar />
        <VideoHero />

        <section className="py-24 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">
            Gallery
          </p>
          <h1 className="mt-6 font-display text-6xl md:text-8xl leading-[1.05] text-fg">
            The Gallery
          </h1>
          <div className="w-16 h-px bg-accent mx-auto mt-6" aria-hidden="true" />
        </section>

        {GALLERY_DATA.map((section) => (
          <GallerySection
            key={section.id}
            section={section}
            onItemClick={open}
          />
        ))}

        <section className="py-16 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-fg/50">
            Fotoğraflar ve anlar, zamanla biriken bir hikâye.
          </p>
        </section>
      </main>
      <SiteFooter />

      {active ? (
        <GalleryItemModal
          item={active.item}
          section={active.section}
          onClose={close}
        />
      ) : null}
    </>
  );
}
