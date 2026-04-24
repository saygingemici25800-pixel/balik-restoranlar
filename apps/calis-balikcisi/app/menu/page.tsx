import type { Metadata } from 'next';
import { SiteTopBar } from '../(sections)/top-bar';
import { SiteFooter } from '../(sections)/footer';
import { MEZELER, IZGARA, TATLI } from './_data';
import { Spotlight } from './_sections/spotlight';
import { FullList } from './_sections/full-list';

export const metadata: Metadata = {
  title: 'Menü — Çalış Balıkçısı',
  description:
    'Çalış sahilinde mezelerden mangala, tatlılara — günün tezgâhından seçilmiş özel menü.',
};

export default function MenuPage() {
  return (
    <>
      <main>
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 text-center">
          <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />
          <p className="text-xs uppercase tracking-[0.4em] text-accent">
            À La Carte
          </p>
          <h1 className="mt-6 font-display text-6xl md:text-8xl leading-[1.05] text-fg">
            The Menu
          </h1>
          <div className="w-16 h-px bg-accent mx-auto mt-6" aria-hidden="true" />
        </section>

        <Spotlight eyebrow={MEZELER.eyebrow} items={MEZELER.spotlight} />
        <FullList label={MEZELER.listLabel} items={MEZELER.fullList} />

        <section className="py-16 md:py-20 px-6 md:px-10">
          <div
            className="max-w-6xl mx-auto aspect-[16/9] bg-fg/5"
            aria-hidden="true"
          />
        </section>

        <Spotlight eyebrow={IZGARA.eyebrow} items={IZGARA.spotlight} />
        <FullList label={IZGARA.listLabel} items={IZGARA.fullList} />

        <Spotlight eyebrow={TATLI.eyebrow} items={TATLI.spotlight} />
        <FullList label={TATLI.listLabel} items={TATLI.fullList} />

        <section className="py-16 md:py-20 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-fg/50">
            Fiyatlar günün taze tezgâhına göre masa başında sunulur.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
