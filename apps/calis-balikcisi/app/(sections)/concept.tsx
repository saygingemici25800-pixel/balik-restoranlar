import Link from 'next/link';

import { ManifestoReveal } from './_manifesto-reveal';

const MANIFESTO_LINES = [
  'Bugün tutulan balık, bu akşam sofrada.',
  "Akdeniz'in tadı, Akif Usta'nın elinde.",
];

export function Concept() {
  return (
    <section>
      <ManifestoReveal eyebrow="FELSEFE" lines={MANIFESTO_LINES} />
      <div className="px-6 md:px-10 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="aspect-[4/5] bg-fg/5" aria-hidden="true" />
          <div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-fg">
              The Purest Expression of the Sea
            </h2>
            <div className="mt-16 space-y-6 text-fg/80 leading-relaxed">
              <p>
                At Çalış Balıkçısı, we believe the ocean speaks for itself. Our culinary philosophy is one of luxurious restraint—removing the unnecessary to reveal the essential character of the wild catch.
              </p>
              <p>
                Sourced daily from local Fethiye fishermen, each ingredient dictates its own preparation. Cooked over open embers, seasoned with indigenous sea salt, and served on dark, elemental ceramics.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-block mt-10 text-xs uppercase tracking-[0.3em] text-accent hover:text-fg transition-colors"
            >
              Discover the Menu →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
