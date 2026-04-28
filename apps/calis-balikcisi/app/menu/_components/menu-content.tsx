'use client';

import { useState } from 'react';
import { SiteTopBar } from '../../(sections)/top-bar';
import { MEZELER, IZGARA, TATLI, type MenuItem } from '../_data';
import { Spotlight } from '../_sections/spotlight';
import { FullList } from '../_sections/full-list';
import { VideoHero } from './video-hero';
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

      <Spotlight
        eyebrow={MEZELER.eyebrow}
        items={MEZELER.spotlight}
        onItemClick={open}
      />
      <FullList
        label={MEZELER.listLabel}
        eyebrow={MEZELER.eyebrow}
        items={MEZELER.fullList}
        onItemClick={open}
      />

      <section className="py-16 md:py-20 px-6 md:px-10">
        <div
          className="max-w-6xl mx-auto aspect-[16/9] bg-fg/5"
          aria-hidden="true"
        />
      </section>

      <Spotlight
        eyebrow={IZGARA.eyebrow}
        items={IZGARA.spotlight}
        onItemClick={open}
      />
      <FullList
        label={IZGARA.listLabel}
        eyebrow={IZGARA.eyebrow}
        items={IZGARA.fullList}
        onItemClick={open}
      />

      <Spotlight
        eyebrow={TATLI.eyebrow}
        items={TATLI.spotlight}
        onItemClick={open}
      />
      <FullList
        label={TATLI.listLabel}
        eyebrow={TATLI.eyebrow}
        items={TATLI.fullList}
        onItemClick={open}
      />

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
