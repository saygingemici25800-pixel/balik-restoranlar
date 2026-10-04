import Image from 'next/image';
import Link from 'next/link';

import { ZoneGate } from '@/app/_components/zone/zone-gate';
import h from '../home.module.css';
import { HomeTopBar } from '../home-top-bar';
import { MaskLines } from '../mask-lines';
import s from './hero.module.css';
import { HeroVideo, HeroVideoDisk, HeroVideoProvider } from './hero-video';

/**
 * Hero: terasın Zone'dan çekilmiş gün batımı filmi (3B canlandırma) tam ekran; sol altta tek
 * başlık kartı — iki satır başlık ve iki kapı (Zone'a gezinti, menü). Film yazının olmadığı her
 * yerde temiz. WebGL yok: film bir video, three yalnız "Terası Keşfet"e basınca iner.
 */
export function Hero() {
  return (
    <section className={`${h.night} ${s.hero}`} aria-labelledby="hero-title">
      <HeroVideoProvider>
        <div className={s.media}>
          <Image
            src="/videos/hero-zone.webp"
            alt="Çalış Balıkçısı'nın terası gün batımında, 3B canlandırma"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={70}
            className="object-cover"
            style={{ objectPosition: 'var(--hero-focus, 50% 50%)' }}
          />
          <HeroVideo webm="/videos/hero-zone.webm" mp4="/videos/hero-zone.mp4" />
        </div>
        <div className={s.scrimTop} aria-hidden="true" />

        <HomeTopBar />

        <div className={s.content}>
          <div className={`${h.wrap} ${s.contentRow}`}>
            <div className={s.card}>
              <MaskLines
                as="h1"
                id="hero-title"
                load
                className={s.title}
                lines={['Güneş denize,', <em key="b">balık köze.</em>]}
              />
              <div className={s.actions}>
                <ZoneGate label="Terası Keşfet" badge="3B" className={s.btnSun} badgeClassName={s.chip} arrowClassName={s.noArrow} />
                <Link href="/menu" className={s.textLink}>
                  <span className={s.underline}>Menüyü Keşfet</span> <span aria-hidden="true" className={s.arrow}>→</span>
                </Link>
              </div>
            </div>
            <HeroVideoDisk className={s.pause} labelClassName={s.pauseLabel} diskClassName={s.disk} />
          </div>
        </div>
      </HeroVideoProvider>
    </section>
  );
}
