import { MENU_MEDIA, RAW_SECTIONS } from '@/app/menu/_data';
import type { MenuItem } from './menu-types';
import { slugify, uniqueId } from './slug';
import type { ContentItem, SiteContent } from './types';

// "350 ₺" -> 350. Rakam içermeyen metin ("Güncel fiyat" vb.) null döner.
function parsePrice(raw: string | undefined): number | null {
  if (!raw || !/\d/.test(raw)) return null;
  const n = Number(raw.replace(/[^\d.,]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function toContentItem(
  item: MenuItem,
  categoryId: string,
  featured: boolean,
  order: number,
  id: string,
): ContentItem {
  const price = parsePrice(item.price);
  const mediaSlug = MENU_MEDIA[item.name];
  return {
    id,
    categoryId,
    name: { tr: item.name, en: undefined, ar: undefined },
    description: item.description,
    longDescription: item.longDescription,
    price,
    unit: item.unit ?? 'portion',
    // Fiyat alanı dolu ama sayı değilse ("Güncel fiyat") günlük fiyat sayılır.
    dailyPrice: Boolean(item.price) && price === null,
    // Medya eşleşmesi varsa poster slug'dan türetilir; eski placeholder
    // (Unsplash vb.) zaten eziliyordu, taşınmaz.
    imageUrl: mediaSlug ? undefined : item.photoUrl,
    mediaSlug,
    featured,
    hidden: Boolean(item.hidden),
    order,
  };
}

// _data.ts'teki ham bölümlerden (gizliler dahil) site-content.json üretir.
// updatedAt boş: henüz storage'a yazılmamış içerik demektir.
export function buildSeedContent(): SiteContent {
  const usedIds = new Set<string>();
  const items: ContentItem[] = [];

  const categories = RAW_SECTIONS.map((section, index) => {
    const ordered = [
      ...section.spotlight.map((item) => ({ item, featured: true })),
      ...section.fullList.map((item) => ({ item, featured: false })),
    ];
    ordered.forEach(({ item, featured }, order) => {
      const id = uniqueId(`${section.id}-${slugify(item.name)}`, usedIds);
      items.push(toContentItem(item, section.id, featured, order, id));
    });
    return {
      id: section.id,
      title: section.title,
      eyebrow: section.eyebrow,
      listLabel: section.listLabel,
      order: index,
    };
  });

  return { version: 1, updatedAt: '', categories, items };
}
