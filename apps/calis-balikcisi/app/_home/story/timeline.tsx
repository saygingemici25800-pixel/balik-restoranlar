import type { CSSProperties } from 'react';

import h from '../home.module.css';

/** Hikâye zaman çizgisi: tek ufuk çizgisi üstünde dört durak (M5 çizgi + M3 duraklar). */
const STOPS = [
  { year: '1999', text: 'Yola çıkış' },
  { year: '2014', text: "Fethiye'de İzmir Balıkçısı" },
  { year: '2020', text: "Çalış'ta Çalış Balıkçısı" },
  { year: 'Bugün', text: 'Aynı tezgâh, aynı tutku.' },
];

export function Timeline() {
  return (
    <div className="mt-16 lg:mt-24">
      <div className={h.rule} data-reveal="rule" aria-hidden="true" />
      <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {STOPS.map((s, n) => (
          <li key={s.year} data-reveal="rise" style={{ '--i': n } as CSSProperties}>
            <span aria-hidden="true" className="mb-4 block h-1.5 w-1.5 rounded-full bg-accent" />
            <span className={s.year === 'Bugün' ? h.h2 : h.numeral}>{s.year}</span>
            <p className={`${h.caption} mt-3 max-w-[16ch]`}>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
