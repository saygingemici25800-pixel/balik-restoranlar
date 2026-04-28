import type { MenuItem } from '../_data';

type Props = {
  eyebrow: string;
  items: MenuItem[];
  onItemClick: (item: MenuItem, eyebrow: string) => void;
};

export function Spotlight({ eyebrow, items, onItemClick }: Props) {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-accent">{eyebrow}</p>
        <div className="w-12 h-px bg-accent mx-auto mt-6" aria-hidden="true" />

        <ul className="mt-16 space-y-12 md:space-y-14">
          {items.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => onItemClick(item, eyebrow)}
                className="font-display text-3xl md:text-4xl text-fg hover:text-accent transition-colors cursor-pointer"
              >
                {item.name}
              </button>
              {item.description ? (
                <p className="mt-4 max-w-md mx-auto text-fg/80 leading-relaxed">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
