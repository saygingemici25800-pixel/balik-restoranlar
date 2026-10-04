import h from '../home.module.css';

/** Kardeş mekân bandı (Kum). Sitenin adresi henüz yok: düğme adres gelince görünür. */
const SISTER_URL: string | null = null;

export function SisterBand() {
  return (
    <section className={`${h.sand} py-10 md:py-12`} aria-labelledby="kardes-title">
      <div className={`${h.wrap} flex flex-col gap-4 md:flex-row md:items-center md:gap-10`}>
        <p className={`${h.label} ${h.sun}`}>Kardeş mekân</p>
        <p id="kardes-title" className="font-headline text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-medium leading-none tracking-[-0.02em]">
          Fethiye Alkolsüz
        </p>
        <p className={`${h.body} ${h.soft} md:flex-1`}>Başka bir sahil, başka bir tat — alkolsüz keyfin merkezi.</p>
        {SISTER_URL ? (
          <a href={SISTER_URL} className={`${h.btn} ${h.btnInkGhost}`}>
            Siteye git <span aria-hidden="true" className={h.arrow}>↗</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
