import type { ContentItem, Unit } from '@/lib/content/types';

// Düzenleyici form durumu: input'lar string tutulur, kayıtta ürüne çevrilir.
export type ItemDraft = {
  categoryId: string;
  nameTr: string;
  nameEn: string;
  nameAr: string;
  price: string;
  unit: Unit;
  dailyPrice: boolean;
  imageUrl: string;
  featured: boolean;
  hidden: boolean;
  description: string;
  longDescription: string;
};

export type ItemInput = Omit<ContentItem, 'id' | 'order' | 'mediaSlug'> & {
  id?: string;
};

export function toDraft(item: ContentItem | null, categoryId: string): ItemDraft {
  return {
    categoryId: item?.categoryId ?? categoryId,
    nameTr: item?.name.tr ?? '',
    nameEn: item?.name.en ?? '',
    nameAr: item?.name.ar ?? '',
    price: item?.price === null || item?.price === undefined ? '' : String(item.price),
    unit: item?.unit ?? 'portion',
    dailyPrice: item?.dailyPrice ?? false,
    imageUrl: item?.imageUrl ?? '',
    featured: item?.featured ?? false,
    hidden: item?.hidden ?? false,
    description: item?.description ?? '',
    longDescription: item?.longDescription ?? '',
  };
}

const blankToUndefined = (v: string) => (v.trim() ? v.trim() : undefined);

// Geçersiz fiyatta hata metni döner; asıl doğrulama sunucuda (Zod) yapılır.
export function fromDraft(draft: ItemDraft, id: string | undefined): ItemInput | string {
  const rawPrice = draft.price.trim().replace(',', '.');
  const price = rawPrice === '' ? null : Number(rawPrice);
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return 'Fiyat geçerli bir sayı olmalı.';
  }
  return {
    id,
    categoryId: draft.categoryId,
    name: {
      tr: draft.nameTr.trim(),
      en: blankToUndefined(draft.nameEn),
      ar: blankToUndefined(draft.nameAr),
    },
    price,
    unit: draft.unit,
    dailyPrice: draft.dailyPrice,
    imageUrl: blankToUndefined(draft.imageUrl),
    featured: draft.featured,
    hidden: draft.hidden,
    description: blankToUndefined(draft.description),
    longDescription: blankToUndefined(draft.longDescription),
  };
}
