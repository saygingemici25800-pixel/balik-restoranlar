import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { CONTACT_INFO } from '@/app/iletisim/_data';
import h from '../home.module.css';
import m from '../motion.module.css';
import { ChapterHead } from '../chapter-head';
import { MaskLines } from '../mask-lines';
import { ContactDetails } from './contact-details';

/** 07 İletişim (Gece): büyük telefon, arama + WhatsApp, akşam cephesi görseli, ayrıntılar. */
const WA = `https://wa.me/905326510848?text=${encodeURIComponent('Merhaba, Çalış Balıkçısı hakkında bilgi almak istiyorum.')}`;
const i = (n: number) => ({ '--i': n }) as CSSProperties;

export function Contact() {
  const { mobile, mobileHref } = CONTACT_INFO;
  return (
    <section id="iletisim" className={`${h.night} ${h.section}`} aria-labelledby="iletisim-title">
      <div className={h.wrap}>
        <ChapterHead no="07" label="İletişim" />
        <div className={`${h.grid} gap-y-12`}>
          <div className="col-span-full lg:col-span-7">
            <MaskLines id="iletisim-title" className={h.h2} lines={['Sahile uğramadan önce,', <em key="e">bir el sallayın.</em>]} />
            <p className={`${h.lede} mt-7`} data-reveal="rise">Telefonun ucunda biz, kapının ardında masanız.</p>
            <a href={mobileHref} className={`${h.phone} mt-10 inline-block transition-colors hover:text-accent`} data-reveal="rise" style={i(1)}>
              {mobile}
            </a>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row" data-reveal="rise" style={i(2)}>
              <a href={mobileHref} className={`${h.btn} ${h.btnSun}`}>
                Bizi arayın <span aria-hidden="true" className={h.arrow}>→</span>
              </a>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={`${h.btn} ${h.btnGhost}`}>
                WhatsApp&apos;tan yazın <span aria-hidden="true" className={h.arrow}>↗</span>
                <span className="sr-only">(yeni sekmede açılır)</span>
              </a>
            </div>
          </div>
          <figure className="col-span-full lg:col-span-4 lg:col-start-9">
            <div className={`${h.frame} aspect-[4/5]`} data-reveal="frame">
              <div className={m.frameInner}>
                <Image src="/web/cephe-bahce.webp" alt="Çalış Balıkçısı'nın akşam cephesi ve ışıklı tabelası" fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover" />
              </div>
            </div>
            <figcaption className={`${h.label} ${h.frameLabel}`}>07.1 — Çalış sahili, akşam</figcaption>
          </figure>
        </div>
        <ContactDetails />
        <Link href="/iletisim" className={`${h.link} ${h.label} mt-10 inline-block`}>
          İletişim sayfası →
        </Link>
      </div>
    </section>
  );
}
