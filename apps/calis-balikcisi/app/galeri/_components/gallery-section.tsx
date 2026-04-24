'use client';

import type {
  GalleryItem,
  GallerySection as GallerySectionData,
} from '../_data';

type Props = {
  section: GallerySectionData;
  onItemClick: (
    item: GalleryItem,
    section: GallerySectionData,
    trigger: HTMLElement,
  ) => void;
};

export function GallerySection({ section, onItemClick }: Props) {
  const topRow = section.featured.slice(0, 3);
  const bottomRow = section.featured.slice(3, 5);

  return (
    <section className="py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">
            {section.eyebrow}
          </p>
          {section.subtitle ? (
            <p className="mt-4 text-fg/70 leading-relaxed">{section.subtitle}</p>
          ) : null}
        </div>

        <div className="mt-12 md:mt-16 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-2 gap-4 md:auto-rows-fr">
            {topRow.map((item, idx) => (
              <FeaturedTile
                key={item.id}
                item={item}
                onClick={(trigger) => onItemClick(item, section, trigger)}
                className={
                  idx === 0
                    ? 'md:col-span-3 md:row-span-2 aspect-[4/3] md:aspect-auto'
                    : 'md:col-span-2 aspect-[4/3] md:aspect-auto'
                }
              />
            ))}
          </div>
          {bottomRow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bottomRow.map((item) => (
                <FeaturedTile
                  key={item.id}
                  item={item}
                  onClick={(trigger) => onItemClick(item, section, trigger)}
                  className="aspect-[4/3]"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-20 md:mt-24 max-w-4xl mx-auto border-t border-fg/10 pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.35em] text-fg/60 text-center">
            — Tüm {section.title} —
          </p>
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
            {section.list.map((listItem) => (
              <li key={listItem.id}>
                <button
                  type="button"
                  onClick={(e) => onItemClick(listItem, section, e.currentTarget)}
                  className="font-display text-base md:text-lg text-fg/90 hover:text-accent transition-colors text-left md:text-center w-full"
                >
                  {listItem.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

type TileProps = {
  item: GalleryItem;
  onClick: (trigger: HTMLElement) => void;
  className?: string;
};

function FeaturedTile({ item, onClick, className = '' }: TileProps) {
  return (
    <button
      type="button"
      onClick={(e) => onClick(e.currentTarget)}
      className={`group relative overflow-hidden bg-fg/5 ${className}`}
      aria-label={item.name}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <span className="absolute bottom-3 left-4 right-4 font-display text-base md:text-lg text-fg/90 opacity-0 group-hover:opacity-100 transition-opacity text-left">
        {item.name}
      </span>
    </button>
  );
}
