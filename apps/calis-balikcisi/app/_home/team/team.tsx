import type { CSSProperties } from 'react';

import h from '../home.module.css';
import { ChapterHead } from '../chapter-head';
import { MaskLines } from '../mask-lines';
import { TeamCard } from './team-card';
import { TEAM_MEMBERS } from './team-data';

/** 04 Ekip (Kum): başlık solda (geniş ekranda yapışkan), kartlar sağda üç sütun, orta sütun basamaklı. */
export function Team() {
  return (
    <section className={`${h.sand} ${h.section}`} aria-labelledby="ekip-title">
      <div className={h.wrap}>
        <ChapterHead no="04" label="Ekip" note="sesi açın" />
        <div className={`${h.grid} gap-y-12`}>
          <div className="col-span-full lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            {/* dar sütunda "ardındakiler." taşmasın: başlık bu sütunda bir boy küçük */}
            <MaskLines id="ekip-title" className={`${h.h2} lg:text-[clamp(2.5rem,0.6rem+3.6vw,4.5rem)]`} lines={['Mutfağın', <em key="a">ardındakiler.</em>]} />
            <p className={`${h.lede} mt-7`} data-reveal="rise">
              Tezgâhtan servise, akşamı birlikte kuranlar. Bir karta dokunun; kendileri anlatsın.
            </p>
          </div>
          <ul className="col-span-full grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:col-span-7 lg:col-start-6">
            {TEAM_MEMBERS.map((t, n) => (
              <li key={t.id} data-reveal="rise" className={n % 3 === 1 ? 'lg:mt-16' : ''} style={{ '--i': n } as CSSProperties}>
                <TeamCard no={String(n + 1).padStart(2, '0')} name={t.name} role={t.role} poster={t.poster} video={t.video} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
