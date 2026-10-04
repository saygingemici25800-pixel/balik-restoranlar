import Image from 'next/image';
import type { CSSProperties } from 'react';

import { CONTACT } from '@/lib/constants';
import h from '../home.module.css';
import m from '../motion.module.css';
import { ChapterHead } from '../chapter-head';
import { MaskLines } from '../mask-lines';
import { GUESTS, type Guest } from './guests-data';

/** 05 Misafirler (Kum): bir misafir defteri — öne çıkan yorum büyük, diğerleri tek sütun. */
function Quote({ g, big = false }: { g: Guest; big?: boolean }) {
  return (
    <figure lang={g.lang} className="border-t border-[var(--color-line-ink)] py-8 first:border-t-0 first:pt-0">
      <blockquote className={big ? h.quoteLg : h.body}>{g.description}</blockquote>
      <figcaption className={`${h.label} ${h.soft} mt-4`}>
        {g.name} · {g.designation}
      </figcaption>
    </figure>
  );
}

export function Guests() {
  const [featured, ...rest] = [GUESTS[1], ...GUESTS.filter((_, n) => n !== 1)].filter((g): g is Guest => !!g);
  const shown = rest.slice(0, 2);
  const more = rest.slice(2);
  return (
    <section className={`${h.sand} ${h.section}`} aria-labelledby="misafir-title">
      <div className={h.wrap}>
        <ChapterHead no="05" label="Misafirler" />
        <div className={`${h.grid} gap-y-12`}>
          <figure className="col-span-full lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <div className={`${h.frame} aspect-[4/5]`} data-reveal="frame">
              <div className={m.frameInner}>
                <Image src="/web/gunbatimi-teras.webp" alt="Teras, gün batımı" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
              </div>
            </div>
            <figcaption className={`${h.label} ${h.frameLabel}`}>05.1 — Teras, gün batımı</figcaption>
          </figure>
          <div className="col-span-full lg:col-span-6 lg:col-start-7">
            <MaskLines id="misafir-title" className={h.h2} lines={['Sofradan sonra', <em key="s">söylenenler.</em>]} />
            <span className={`${h.qmark} mt-10`} aria-hidden="true">“</span>
            <div className="mt-6" data-reveal="rise">{featured ? <Quote g={featured} big /> : null}</div>
            {shown.map((g, n) => (
              <div key={g.id} data-reveal="rise" style={{ '--i': n + 1 } as CSSProperties}>
                <Quote g={g} />
              </div>
            ))}
            {more.length ? (
              <details className="group border-t border-[var(--color-line-ink)] pt-6">
                <summary className={`${h.label} cursor-pointer list-none`}>Diğer yorumlar ({more.length})</summary>
                <div className="mt-6">{more.map((g) => <Quote key={g.id} g={g} />)}</div>
              </details>
            ) : null}
            <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${h.link} ${h.label} mt-10 inline-block`}>
              Google&apos;da tüm yorumlar ↗<span className="sr-only">(yeni sekmede açılır)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
