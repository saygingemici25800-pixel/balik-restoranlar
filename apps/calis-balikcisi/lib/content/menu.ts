import { unstable_cache } from 'next/cache';
import { MENU_DATA } from '@/app/menu/_data';
import { posterUrl, videoUrl } from './media';
import type { MenuItem, MenuSection } from './menu-types';
import { readContent } from './store';
import type { ContentItem, SiteContent } from './types';

export const MENU_TAG = 'menu';

function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order;
}

function toMenuItem(item: ContentItem): MenuItem {
  return {
    id: item.id,
    name: item.name.tr,
    description: item.description,
    longDescription: item.longDescription,
    price: item.price === null ? undefined : `${item.price} ₺`,
    unit: item.unit === 'kg' ? 'kg' : undefined,
    dailyPrice: item.dailyPrice || undefined,
    photoUrl:
      item.imageUrl ?? (item.mediaSlug ? posterUrl(item.mediaSlug) : undefined),
    videoUrl: item.mediaSlug ? videoUrl(item.mediaSlug) : undefined,
  };
}

// Storage içeriğini sitenin mevcut MenuSection şekline çevirir. Gizli ürünler
// ve görünür ürünü kalmayan kategoriler çıkarılır.
export function toMenuSections(content: SiteContent): MenuSection[] {
  const visible = content.items.filter((item) => !item.hidden).sort(byOrder);
  return [...content.categories]
    .sort(byOrder)
    .map((category) => {
      const items = visible.filter((item) => item.categoryId === category.id);
      return {
        id: category.id,
        eyebrow: category.eyebrow,
        title: category.title,
        listLabel: category.listLabel,
        spotlight: items.filter((i) => i.featured).map(toMenuItem),
        fullList: items.filter((i) => !i.featured).map(toMenuItem),
      };
    })
    .filter((s) => s.spotlight.length + s.fullList.length > 0);
}

// Okuma hatası fırlatılır ki unstable_cache hatalı sonucu önbelleğe almasın.
const loadContent = unstable_cache(
  async () => {
    const result = await readContent();
    if (result.status === 'error') throw new Error(result.error);
    return result.content;
  },
  ['site-content-v1'],
  { tags: [MENU_TAG], revalidate: 3600 },
);

export async function getMenuSections(): Promise<MenuSection[]> {
  try {
    return toMenuSections(await loadContent());
  } catch (err) {
    console.error('[menu] içerik okunamadı, _data.ts yedeğine düşüldü:', err);
    return MENU_DATA;
  }
}
