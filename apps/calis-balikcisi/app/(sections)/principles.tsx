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

type Row =
  | { kind: 'letter'; char: string; x: number }
  | { kind: 'line'; x: number; w: number };

const AKIS_ROWS: Row[] = [
  { kind: 'letter', char: 'A', x: 22 },
  { kind: 'line', x: 18, w: 90 },
  { kind: 'letter', char: 'K', x: 44 },
  { kind: 'letter', char: 'I', x: 58 },
  { kind: 'letter', char: 'Ş', x: 36 },
  { kind: 'line', x: 30, w: 140 },
  { kind: 'letter', char: 'A', x: 28 },
  { kind: 'letter', char: 'K', x: 50 },
  { kind: 'line', x: 42, w: 60 },
  { kind: 'letter', char: 'I', x: 42 },
  { kind: 'letter', char: 'Ş', x: 24 },
  { kind: 'letter', char: 'A', x: 38 },
  { kind: 'line', x: 20, w: 120 },
  { kind: 'letter', char: 'K', x: 52 },
  { kind: 'letter', char: 'I', x: 30 },
  { kind: 'line', x: 44, w: 45 },
  { kind: 'letter', char: 'Ş', x: 46 },
  { kind: 'letter', char: 'A', x: 20 },
  { kind: 'letter', char: 'K', x: 54 },
  { kind: 'line', x: 28, w: 170 },
  { kind: 'letter', char: 'I', x: 40 },
  { kind: 'letter', char: 'Ş', x: 32 },
  { kind: 'letter', char: 'A', x: 48 },
  { kind: 'line', x: 22, w: 80 },
  { kind: 'letter', char: 'K', x: 26 },
  { kind: 'letter', char: 'I', x: 56 },
  { kind: 'letter', char: 'Ş', x: 38 },
  { kind: 'line', x: 36, w: 110 },
  { kind: 'letter', char: 'A', x: 44 },
  { kind: 'letter', char: 'K', x: 22 },
  { kind: 'letter', char: 'I', x: 50 },
  { kind: 'letter', char: 'Ş', x: 34 },
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
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-20 md:mb-24">
          <p className="text-xs uppercase tracking-[0.4em] text-accent mb-6">
            Prensipler
          </p>
          <h2
            className="font-display italic text-fg leading-[1.1]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            Bir günün üç vakti
          </h2>
        </header>

        <div className="grid md:grid-cols-12 gap-8 md:gap-16">
          <aside
            aria-hidden="true"
            className="hidden md:block md:col-span-5"
          >
            <div className="sticky top-24">
              <div
                className="relative pointer-events-none"
                style={{ height: '70vh', minHeight: '560px' }}
              >
                {AKIS_ROWS.map((row, i) => {
                  const top = (i / (AKIS_ROWS.length - 1)) * 100;
                  if (row.kind === 'letter') {
                    return (
                      <span
                        key={i}
                        style={{ top: `${top}%`, left: `${row.x}%` }}
                        className="absolute -translate-y-1/2 font-display italic text-2xl leading-none text-fg/40"
                      >
                        {row.char}
                      </span>
                    );
                  }
                  return (
                    <span
                      key={i}
                      style={{
                        top: `${top}%`,
                        left: `${row.x}%`,
                        width: `${row.w}px`,
                      }}
                      className="absolute -translate-y-1/2 h-px bg-fg/15"
                    />
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="md:col-span-7 divide-y divide-fg/15">
            {SCHEDULE.map((item) => (
              <div key={item.time} className="py-12 first:pt-0 last:pb-0">
                <p className="text-sm tracking-[0.2em] text-fg/50">
                  {item.time}
                </p>
                <h3 className="mt-2 font-display italic text-3xl md:text-4xl text-fg">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-md text-fg/70 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
