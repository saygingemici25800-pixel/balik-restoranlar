type Catch = {
  name: string;
  latin: string;
  tag: string;
};

const CATCHES: Catch[] = [
  { name: 'Wild Seabass', latin: 'Dicentrarchus labrax', tag: 'Wood Fired' },
  { name: 'Red Mullet', latin: 'Mullus barbatus', tag: 'Crudo' },
];

export function DailyHarvest() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 md:items-end gap-6 md:gap-12 mb-12 md:mb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4">
              Daily Harvest
            </p>
            <h2 className="font-display text-5xl md:text-6xl leading-tight text-fg">
              {"Today's Catch"}
            </h2>
          </div>
          <p className="text-fg/70 leading-relaxed md:text-right md:max-w-sm md:justify-self-end">
            Subject to the whims of the Mediterranean tides. Market price.
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
      </div>
    </section>
  );
}
