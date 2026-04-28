import type { MenuItem } from '../_data';

type Props = {
  label: string;
  items: MenuItem[];
  eyebrow: string;
  onItemClick: (item: MenuItem, eyebrow: string) => void;
};

export function FullList({ label, items, eyebrow, onItemClick }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="py-20 md:py-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto border-t border-fg/10 pt-16 md:pt-20">
        <p className="text-xs uppercase tracking-[0.35em] text-fg/60 text-center">
          {label}
        </p>

        <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          {items.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => onItemClick(item, eyebrow)}
                className="font-display text-lg md:text-xl text-fg/90 hover:text-accent transition-colors cursor-pointer text-center md:text-left w-full"
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
