'use client';

import { useState } from 'react';
import { SiteTopBar } from '../../(sections)/top-bar';
import { type MenuItem } from '../_data';
import { VideoHero } from './video-hero';
import { MenuDemoVideo } from './menu-demo-video';
import { MenuAccordion } from './menu-accordion';
import { MenuItemModal } from './menu-item-modal';

type Active = { item: MenuItem; eyebrow: string } | null;

export function MenuContent() {
  const [active, setActive] = useState<Active>(null);

  function open(item: MenuItem, eyebrow: string) {
    setActive({ item, eyebrow });
  }

  function close() {
    setActive(null);
  }

  return (
    <>
      <SiteTopBar />
      <VideoHero />

      <section className="pt-8 pb-16 md:pt-12 md:pb-20 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-accent">
          À La Carte
        </p>
        <h1 className="mt-6 font-display text-6xl md:text-8xl leading-[1.05] text-fg">
          The Menu
        </h1>
        <div className="w-16 h-px bg-accent mx-auto mt-6" aria-hidden="true" />
      </section>

      <MenuDemoVideo />

      <MenuAccordion onItemClick={open} />

      <section className="py-16 md:py-20 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-fg/50">
          Fiyatlar günün taze tezgâhına göre masa başında sunulur.
        </p>
      </section>

      {active ? (
        <MenuItemModal
          item={active.item}
          eyebrow={active.eyebrow}
          onClose={close}
        />
      ) : null}
    </>
  );
}
