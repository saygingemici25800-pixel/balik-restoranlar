import type { CSSProperties } from 'react';

import { mediaUrl } from '@/lib/media';
import h from '../home.module.css';
import m from '../motion.module.css';
import { ChapterHead } from '../chapter-head';
import { HandNote } from '../hand-note';
import { MaskLines } from '../mask-lines';
import { AmbientGroup, AmbientVideo, VideoToggle } from '../media';
import { Timeline } from './timeline';

/** 02 Hikâye (Gece): iç salon videosu + kısa hikâye + zaman çizgisi. */
const i = (n: number) => ({ '--i': n }) as CSSProperties;

export function Story() {
  return (
    <section className={`${h.night} ${h.section}`} aria-labelledby="hikaye-title">
      <AmbientGroup>
        <div className={h.wrap}>
          <ChapterHead no="02" label="Hikâye" note="1999'dan beri" />
          <div className={h.grid}>
            <MaskLines id="hikaye-title" className={`${h.h2} col-span-full lg:col-span-6 lg:col-start-7 lg:row-start-1`} lines={['Denizin en', <span key="y"><em>yalın</em> hâli.</span>]} />
            <figure className="col-span-full mt-10 lg:col-span-5 lg:row-span-2 lg:row-start-1 lg:mt-0">
              <div className={`${h.frame} aspect-[4/5]`} data-reveal="frame">
                <div className={m.frameInner}>
                  <AmbientVideo src={mediaUrl('web/ic-mekan.mp4')} poster="/web/ic-mekan.webp" sizes="(min-width:1024px) 40vw, 100vw" objectPosition="50% 40%" />
                </div>
                <VideoToggle compact className="absolute bottom-3 right-3 border border-fg/50 bg-bg/70 text-fg" />
              </div>
              <figcaption className={`${h.label} ${h.frameLabel}`}>02.1 — Bir akşam, Çalış&apos;ta</figcaption>
            </figure>
            <div className="col-span-full mt-10 lg:col-span-6 lg:col-start-7 lg:mt-8">
              <p className={h.body} data-reveal="rise" style={i(0)}>
                1999&apos;da deniz ürünlerine duyduğumuz tutkuyla yola çıktık. 2014&apos;te Fethiye&apos;de İzmir Balıkçısı&apos;nı kurduk; 2020&apos;de bu deneyimi Çalış sahiline taşıyıp Çalış Balıkçısı&apos;nı açtık.
              </p>
              <p className={`${h.body} mt-6`} data-reveal="rise" style={i(1)}>
                Bugün de aynı tutkuyla: balık sabah tezgâha gelir, meze evde hazırlanır, akşam acele etmez.
              </p>
              <span className="mt-8 inline-block" data-reveal="rise" style={i(2)}>
                <HandNote shape="underline">Akif Usta ve ekibi</HandNote>
              </span>
            </div>
          </div>
          <Timeline />
        </div>
      </AmbientGroup>
    </section>
  );
}
