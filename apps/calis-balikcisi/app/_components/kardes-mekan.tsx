/**
 * Kardeş mekan bandı: eskiden hero üzerinde yüzen tab + modal yerine, footer'ın
 * hemen üstünde ince/kompakt yatay bir bant. Marka adı (wordmark) + tek satır
 * tanıtım + "Siteye git" butonu. Link/hedef eskisiyle aynı (kardeş site URL'i
 * henüz yer tutucu: #).
 */
export function KardesMekan() {
  return (
    <section
      aria-labelledby="kardes-mekan-title"
      className="border-t border-fg/10 px-6 md:px-10 py-8 md:py-10"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:text-left">
        <div className="shrink-0">
          <span className="eyebrow">Kardeş Mekan</span>
          <p
            id="kardes-mekan-title"
            className="mt-1 font-display text-2xl md:text-3xl leading-tight text-fg"
          >
            Fethiye Alkolsüz
          </p>
        </div>

        <p className="text-sm leading-relaxed text-fg/70 sm:flex-1">
          Başka bir sahil, başka bir tat — alkolsüz keyfin merkezi.
        </p>

        <a
          href="#"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-center border border-accent/60 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-bg"
        >
          Siteye git →
        </a>
      </div>
    </section>
  );
}
