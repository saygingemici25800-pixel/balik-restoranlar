import Link from 'next/link';

const CATEGORIES = ['Çiğ ve Tuzlamalar', 'Köz Üzerinde', 'Tatlı Vakti'] as const;

export function MenuPreview() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="font-display text-5xl md:text-6xl text-fg">Sofra</h2>
          <div className="w-12 h-px bg-accent mx-auto mt-6" aria-hidden="true" />
        </div>

        <div className="mt-12 md:mt-16 mx-auto w-full max-w-[720px] aspect-video flex items-center justify-center rounded-sm border border-dashed border-fg/20 bg-fg/[0.04]">
          <span className="font-display italic text-base md:text-lg text-fg/35 tracking-[0.02em]">
            video gelecek
          </span>
        </div>

        <ul
          aria-label="Sofra kategorileri"
          className="mt-[60px] flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-y-3 text-[11px] md:text-xs uppercase tracking-[0.32em] text-fg/55"
        >
          {CATEGORIES.map((title, idx) => (
            <li key={title} className="flex items-center">
              <span>{title}</span>
              {idx < CATEGORIES.length - 1 ? (
                <span aria-hidden="true" className="hidden md:inline px-5 text-accent/60">
                  ·
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link
            href="/menu"
            className="kalam-bold inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-[0.2em] text-accent border border-accent rounded-sm transition-colors duration-300 hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Sofrayı Gör
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
