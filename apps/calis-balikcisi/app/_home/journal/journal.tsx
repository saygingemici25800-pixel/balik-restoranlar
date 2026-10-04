import type { CSSProperties } from 'react';

import { mediaUrl } from '@/lib/media';
import h from '../home.module.css';
import m from '../motion.module.css';
import { ChapterHead } from '../chapter-head';
import { MaskLines } from '../mask-lines';
import { AmbientGroup, AmbientVideo, VideoToggle } from '../media';

/** 06 Günlük (Gece): Instagram — iki dikey video, basamaklı. */
const VIDEOS = [
  { name: 'insta-1', cls: 'w-[54%]' },
  { name: 'insta-2', cls: 'w-[42%] mt-12 lg:mt-24' },
];

export function Journal() {
  return (
    <section className={`${h.night} ${h.section}`} aria-labelledby="gunluk-title">
      <AmbientGroup>
        <div className={h.wrap}>
          <ChapterHead no="06" label="Günlük" aside={<VideoToggle className="text-fg" />} />
          <div className={`${h.grid} items-center gap-y-12`}>
            <div className="col-span-full lg:col-span-5">
              <MaskLines id="gunluk-title" className={h.handle} lines={['@calis', 'balikcisi']} />
              <p className={`${h.lede} mt-7`} data-reveal="rise">
                Tezgâhın tazesi, köz üstündeki balık ve sahildeki akşamlar — günlük kareler Instagram&apos;da.
              </p>
              <div className="mt-10" data-reveal="rise" style={{ '--i': 1 } as CSSProperties}>
                <a href="https://www.instagram.com/calisbalikcisi/" target="_blank" rel="noopener noreferrer" className={`${h.btn} ${h.btnGhost}`}>
                  Instagram&apos;da takip et <span aria-hidden="true" className={h.arrow}>↗</span>
                  <span className="sr-only">(yeni sekmede açılır)</span>
                </a>
              </div>
            </div>
            <div className="col-span-full flex items-start justify-center gap-4 lg:col-span-6 lg:col-start-7 lg:gap-6">
              {VIDEOS.map((v, n) => (
                <div key={v.name} className={`${h.frame} aspect-[9/16] ${v.cls}`} data-reveal="frame" style={{ '--i': n } as CSSProperties}>
                  <div className={m.frameInner}>
                    <AmbientVideo src={mediaUrl(`web/${v.name}.mp4`)} poster={`/web/${v.name}.webp`} sizes="(min-width:1024px) 300px, 46vw" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AmbientGroup>
    </section>
  );
}
