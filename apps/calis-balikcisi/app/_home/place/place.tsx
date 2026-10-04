import type { CSSProperties } from 'react';

import { mediaUrl } from '@/lib/media';
import h from '../home.module.css';
import m from '../motion.module.css';
import { ChapterHead } from '../chapter-head';
import { HandNote } from '../hand-note';
import { MaskLines } from '../mask-lines';
import { AmbientGroup, AmbientVideo, VideoToggle } from '../media';

/** 03 Mekân (Gece): üç dikey video yan yana (geniş ekranda basamaklı), telefonda kaydırmalı ray. */
const TILES = [
  { name: 'teras-manzara', no: '03.1', label: 'Teras', caption: 'Deniz, dağ ve gün batımında dolu masalar.', offset: 'lg:mt-0' },
  // meze karesinin üst üçte biri raftaki şişeler: vitrine yakınlaşılır (mesaj yemek odaklı, içki değil)
  { name: 'meze-detay', no: '03.2', label: 'Meze', caption: 'Soğuk meze tabaklarımızdan, ev yapımı.', offset: 'lg:mt-24', zoom: true },
  { name: 'reyon-detay', no: '03.3', label: 'Reyon', caption: 'Tezgâhın o günkü tazesi, gözünüzün önünde.', offset: 'lg:mt-8' },
];

export function Place() {
  return (
    <section className={`${h.night} ${h.section}`} aria-labelledby="mekan-title">
      <AmbientGroup>
        <div className={h.wrap}>
          <ChapterHead no="03" label="Mekân" aside={<VideoToggle className="text-fg" />} />
          <div className={`${h.grid} items-end`}>
            <div className="col-span-full lg:col-span-7">
              <MaskLines id="mekan-title" className={h.h2} lines={['Deniz, dağ,', <em key="g">gün batımı.</em>]} />
              <span className="mt-6 hidden md:inline-block" data-reveal="rise">
                <HandNote shape="arrow">güneş tam karşıda batar</HandNote>
              </span>
            </div>
            <p className={`${h.lede} col-span-full mt-7 lg:col-span-4 lg:col-start-9 lg:mt-0`} data-reveal="rise">
              Çalış sahilinde, güneşin denize battığı yerde. Üstte teras, altta tezgâh.
            </p>
          </div>
          <div
            role="region"
            aria-label="Mekân videoları"
            tabIndex={0}
            className="-mx-[var(--gutter)] mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-2 [scroll-padding-inline:var(--gutter)] [scrollbar-width:none] lg:mx-auto lg:grid lg:max-w-[64rem] lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {TILES.map((t, n) => (
              <figure key={t.name} className={`w-[72vw] max-w-[320px] shrink-0 snap-start lg:w-auto lg:max-w-none ${t.offset}`}>
                <div className={`${h.frame} aspect-[9/16]`} data-reveal="frame" style={{ '--i': n } as CSSProperties}>
                  <div className={m.frameInner}>
                    <div className={`absolute inset-0 ${'zoom' in t ? 'origin-bottom scale-[1.6]' : ''}`}>
                      <AmbientVideo
                        src={mediaUrl(`web/${t.name}.mp4`)}
                        poster={`/web/${t.name}.webp`}
                        sizes="(min-width:1024px) 340px, 72vw"
                        playThreshold={'zoom' in t ? 0.3 : 0.5}
                      />
                    </div>
                  </div>
                </div>
                <figcaption className="mt-4">
                  <span className={`${h.label} ${h.sun}`}>{t.no} — {t.label}</span>
                  <span className={`${h.caption} mt-2 block`}>{t.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className={`${h.note} mt-4 lg:hidden`} aria-hidden="true">kaydırın →</p>
        </div>
      </AmbientGroup>
    </section>
  );
}
