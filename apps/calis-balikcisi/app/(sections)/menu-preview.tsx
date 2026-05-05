import Link from 'next/link';

type Category = {
  slug: string;
  title: string;
};

const CATEGORIES: Category[] = [
  { slug: 'raw-cured', title: 'Çiğ ve Tuzlamalar' },
  { slug: 'embers', title: 'Köz Üzerinde' },
  { slug: 'final-act', title: 'Tatlı Vakti' },
];

export function MenuPreview() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="font-display text-5xl md:text-6xl text-fg">Sofra</h2>
          <div className="w-12 h-px bg-accent mx-auto mt-6" aria-hidden="true" />
        </div>

        <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-10 md:gap-12">
          {CATEGORIES.map((cat) => (
            <div key={cat.slug} className="text-center">
              <div className="aspect-[3/4] bg-fg/5" aria-hidden="true" />
              <h3 className="mt-8 font-display text-2xl md:text-3xl text-fg">
                {cat.title}
              </h3>
              <Link
                href={`/menu#${cat.slug}`}
                className="inline-block mt-4 text-xs uppercase tracking-[0.3em] text-accent hover:text-fg transition-colors"
              >
                Sofrayı görmek için tıkla →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
