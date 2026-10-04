import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import h from '../home.module.css';
import { ChapterHead } from '../chapter-head';
import { HandNote } from '../hand-note';
import { MaskLines } from '../mask-lines';

/**
 * 01 Sofra — menünün kendi hero'su (Kum). Fotoğraf sağ kenara taşar; küçük yazı fotoğrafın
 * üstüne hiç binmez. Menü sayfasının kendisine dokunulmaz, yalnız oraya kapı açılır.
 */
const INDEX = ['Çorbalar', 'Mezeler', 'Ara Sıcaklar', 'Balıklarımız', 'Spesiyal Levrek Lokum', 'Tatlı Çeşitleri'];
const i = (n: number) => ({ '--i': n }) as CSSProperties;

export function MenuFeature() {
  return (
    <section id="sofra" className={`${h.sand} lg:grid lg:min-h-[max(40rem,min(100svh,62rem))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]`} aria-labelledby="sofra-title">
      <div className="relative aspect-[4/5] lg:order-2 lg:aspect-auto" data-reveal="settle">
        {/* `h.frame` burada yok: onun `position: relative`'i `absolute`'u ezip kutuyu sıfır yüksekliğe indiriyordu */}
        <div className="absolute inset-0 overflow-hidden bg-sand-deep">
          <Image
            src="/web/balik-reyonu-1.webp"
            alt="Balık reyonu: buzun üstünde günün balıkları, üst rafta mezeler"
            fill
            sizes="(min-width:1024px) 53vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '50% 55%' }}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center px-[var(--gutter)] pb-[var(--section-y)] pt-12 lg:order-1 lg:py-[var(--section-y)] lg:pe-[clamp(2rem,4vw,5rem)] lg:ps-[max(var(--gutter),calc((100vw-var(--maxw))/2))]">
        <ChapterHead no="01" label="Sofra" />
        <MaskLines id="sofra-title" className={h.h2} lines={['Tezgâhtan', <em key="s">sofraya.</em>]} />
        <p className={`${h.lede} mt-7`} data-reveal="rise" style={i(1)}>
          Buzun üstünde günün balığı, yanında evde hazırlanan mezeler. Seçin; gerisini köz halleder.
        </p>
        <span className="mt-8" data-reveal="rise" style={i(2)}>
          <HandNote shape="underline">imza tabak: levrek lokum</HandNote>
        </span>
        <ul aria-label="Menü bölümleri" className={`${h.label} ${h.soft} mt-8 flex flex-wrap gap-x-3 gap-y-2`} data-reveal="rise" style={i(3)}>
          {INDEX.map((t, n) => (
            <li key={t} className="flex items-center gap-3">
              {n > 0 ? <span aria-hidden="true" className={h.sun}>·</span> : null}
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-10" data-reveal="rise" style={i(4)}>
          <Link href="/menu" className={`${h.btn} ${h.btnInk}`}>
            Menüyü Keşfet <span aria-hidden="true" className={h.arrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
