import Image from 'next/image';
import { WebVideo } from '../_components/web-video';

const R2 = 'https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev/web';

const TILES = [
  {
    name: 'teras-manzara',
    label: 'Teras',
    caption: 'Deniz, dağ ve gün batımında dolu masalar.',
  },
  {
    name: 'meze-detay',
    label: 'Meze',
    caption: 'Soğuk meze tabaklarımızdan, ev yapımı.',
  },
  {
    name: 'reyon-detay',
    label: 'Tazelik',
    caption: 'Tezgâhın o günkü tazesi, gözünüzün önünde.',
  },
];

export function Atmosfer() {
  return (
    <section
      className="py-24 md:py-32 px-6 md:px-10"
      aria-labelledby="atmosfer-title"
    >
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-sm aspect-[16/10] md:aspect-[3/1]">
          <Image
            src="/web/cephe-bahce.webp"
            alt="Çalış Balıkçısı — bahçeli teras"
            fill
            sizes="(min-width: 768px) 72rem, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-bg/85 via-bg/30 to-bg/45"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p
              className="text-xs uppercase tracking-[0.4em] text-accent mb-4"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
            >
              Mekan
            </p>
            <h2
              id="atmosfer-title"
              className="font-display font-bold tracking-[-0.01em] text-4xl md:text-6xl text-fg leading-tight"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
            >
              Atmosfer
            </h2>
          </div>
        </div>

        <div className="mt-8 md:mt-12 flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TILES.map((t) => (
            <figure
              key={t.name}
              className="snap-start shrink-0 w-[70vw] sm:w-[280px] md:w-[300px]"
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-fg/5">
                <WebVideo
                  src={`${R2}/${t.name}.mp4`}
                  poster={`/web/${t.name}.webp`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-center">
                <span className="block font-display italic text-lg text-fg">
                  {t.label}
                </span>
                <span className="mt-1 block text-sm text-fg/55">
                  {t.caption}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
