import type { CSSProperties } from 'react';

type Schedule = {
  time: string;
  title: string;
  body: string;
};

const SCHEDULE: Schedule[] = [
  {
    time: '05:30',
    title: 'Taze Tutma',
    body: 'Akif Usta, her sabah şafakla birlikte Çalış koyunda tezgâhını kurar. O gün için en taze levrek, çipura ve mevsim balıkları seçilir. Buz üzerinde, güneş vurmadan tezgâha konur. Tazelik, ilk ve tek kriterimizdir.',
  },
  {
    time: '12:00',
    title: 'Az Müdahale',
    body: 'Balığın kendi lezzetini ön plana çıkarmak için fazla baharata, ağır soslara yer yok. Zeytinyağı, limon, deniz tuzu. Hepsi bu. Mutfakta iki saat bekleyen yemek değil, tezgâhtan direkt ateşe giden balık.',
  },
  {
    time: '19:00',
    title: 'Doğal Ateş',
    body: 'Mangalın üzerinde odun közü. Balık derisini koruyarak, yavaş ve emin ateşle pişer. Servis akşamla başlar, gün batımıyla yükselir. Sofranızdaki son nokta, denizin başlangıcı.',
  },
];

const sectionVars = {
  '--color-bg': '#FBFAF6',
  '--color-fg': '#1A2F3A',
} as CSSProperties;

export function Principles() {
  return (
    <section
      style={sectionVars}
      className="bg-bg text-fg py-32 md:py-48 px-6 md:px-10"
    >
      <div className="mx-auto" style={{ maxWidth: '900px' }}>
        <header className="text-center mb-20 md:mb-24">
          <p className="text-[11px] uppercase tracking-[0.5em] text-fg/45 mb-6">
            Az müdahale, çok ihtimam
          </p>
          <h2
            className="font-display italic text-fg leading-[1.1]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            Bir günün üç vakti
          </h2>
        </header>

        <div className="divide-y divide-fg/15">
          {SCHEDULE.map((item) => (
            <div
              key={item.time}
              className="py-12 first:pt-0 last:pb-0 text-center"
            >
              <p className="text-sm tracking-[0.2em] text-fg/50">
                {item.time}
              </p>
              <h3 className="mt-2 font-display italic text-3xl md:text-4xl text-fg">
                {item.title}
              </h3>
              <p className="mt-4 mx-auto max-w-xl text-fg/70 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
