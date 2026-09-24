// Sitenin menü görünümünün tükettiği şekil. Storage şemasından (types.ts)
// bağımsızdır; menu.ts adaptörü storage içeriğini bu tiplere çevirir.

export type MenuItem = {
  id?: string;
  name: string;
  description?: string;
  photoUrl?: string;
  videoUrl?: string;
  longDescription?: string;
  price?: string;
  /** Fiyat birimi. 'kg' -> "kg <price>" gösterilir; varsayılan 'portion'. */
  unit?: 'kg' | 'portion';
  /** İşaretliyse fiyat yerine "Günlük fiyat" gösterilir. */
  dailyPrice?: boolean;
  /** Fiyatı henüz girilmemiş ürün: canlıda gösterilmez. */
  hidden?: boolean;
};

export type MenuSection = {
  id: string;
  eyebrow: string;
  title: string;
  listLabel: string;
  spotlight: MenuItem[];
  fullList: MenuItem[];
};
