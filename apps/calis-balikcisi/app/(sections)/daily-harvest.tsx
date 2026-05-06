import Image from 'next/image';

type Catch = {
  name: string;
  latin: string;
  tag: string;
};

const CATCHES: Catch[] = [
  { name: 'Levrek', latin: 'Dicentrarchus labrax', tag: 'Köz Üzerinde' },
  { name: 'Barbun', latin: 'Mullus barbatus', tag: 'Çiğ' },
];

const TEZGAH_PHOTOS = [
  { src: '/images/tezgah-1.jpg', alt: 'Bugün tezgâhta — taze balık' },
  { src: '/images/tezgah-2.jpg', alt: 'Bugün tezgâhta — mezat sonrası' },
];

export function DailyHarvest() {
  return (
    <section id="bugun-tezgahta" className="py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 md:items-end gap-6 md:gap-12 mb-12 md:mb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4">
              Günün Mezadı
            </p>
            <h2 className="font-display text-5xl md:text-6xl leading-tight text-fg">
              Bugün Tezgâhta
            </h2>
          </div>
          <p
            className="font-display text-fg/75 leading-relaxed md:text-right md:max-w-sm md:justify-self-end"
            style={{ fontFamily: 'var(--serif)' }}
          >
            Tezgâh, denizin getirdiğine göre değişir. O yüzden fiyat da, günün ne tuttuğuna göre.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {CATCHES.map((item) => (
            <article
              key={item.name}
              className="relative aspect-[4/3] bg-fg/5 overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/10 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl text-fg">
                    {item.name}
                  </h3>
                  <p className="italic text-fg/70 mt-1">{item.latin}</p>
                </div>
                <span className="shrink-0 text-xs uppercase tracking-[0.3em] text-accent border border-accent/40 px-3 py-1">
                  {item.tag}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {TEZGAH_PHOTOS.map((photo) => (
            <div
              key={photo.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-fg/5"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
