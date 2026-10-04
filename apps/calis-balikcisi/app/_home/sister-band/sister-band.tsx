import h from '../home.module.css';

/** Kardeş mekân bandı (Kum): İzmir Balıkçısı — Fethiye'de alkolsüz, aile dostu balık restoranı. */
const SISTER = { name: 'İzmir Balıkçısı', href: 'https://izmirbalik.com', host: 'izmirbalik.com' } as const;

export function SisterBand() {
  return (
    <section className={`${h.sand} py-10 md:py-12`} aria-labelledby="kardes-title">
      <div className={`${h.wrap} flex flex-col gap-4 md:flex-row md:items-center md:gap-10`}>
        <p className={`${h.label} ${h.sun}`}>Kardeş mekân</p>
        <p id="kardes-title" className="font-headline text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-medium leading-none tracking-[-0.02em]">
          {SISTER.name}
        </p>
        <p className={`${h.body} ${h.soft} md:flex-1`}>Fethiye&apos;de alkolsüz, aile dostu bir balık sofrası.</p>
        <a href={SISTER.href} target="_blank" rel="noopener" className={`${h.btn} ${h.btnInkGhost}`}>
          {SISTER.host} <span aria-hidden="true" className={h.arrow}>↗</span>
          <span className="sr-only"> (yeni sekmede açılır)</span>
        </a>
      </div>
    </section>
  );
}
