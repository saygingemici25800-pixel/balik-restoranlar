/**
 * Misafir yorumları — eski yorum bölümünden birebir taşındı (Google). Göreli tarihler
 * ("4 hafta önce") eskidiği için gösterilmez; veride duruyor.
 */
export type Guest = {
  id: string;
  platform: 'google' | 'tripadvisor' | 'instagram';
  name: string;
  designation: string;
  description: string;
  date: string;
  /** İngilizce yorum ekran okuyucuya doğru dille okunsun. */
  lang?: string;
};

export const GUESTS: readonly Guest[] = [
  {
    id: '1',
    platform: 'google',
    name: 'Selin A.',
    designation: 'Google',
    date: '4 hafta önce',
    description:
      'Mertay isimli personelinizden inanılmaz memnun kaldık. Güler yüzü ve işini severek yapması sebebiyle tekrar tekrar geleceğiz. Çok teşekkür ederiz.',
  },
  {
    id: '2',
    platform: 'google',
    name: 'Ahmet Mart',
    designation: 'Google',
    date: '7 ay önce',
    description:
      'Levrek lokum balığın en güzel hali olabilir, çok beğendim. Karides beklentimin çok üzerindeydi. Girit güzeli mezesi çok lezzetliydi. Mekan büyük, ferah, manzara çok güzel. Tavsiye ederim.',
  },
  {
    id: '3',
    platform: 'google',
    name: 'S. D.',
    designation: 'Google',
    date: '5 ay önce',
    description:
      'Çalış Balıkçısı bizim için çok özel bir adres. Her yıl 7-8 kez keyifle geliyoruz, her seferinde en kaliteli şekilde ağırlanıyoruz. Balıklar taze, sunumlar mükemmel. Tüm ekip güler yüzlü ve profesyonel. İyi ki varsınız!',
  },
  {
    id: '4',
    platform: 'google',
    name: 'Mert Yaşar Çetingök',
    designation: 'Google',
    date: '9 ay önce',
    description:
      'Mezeler çok çeşit ve lezzetli. Fesleğenli levrek marin çok çok iyiydi. Kalamar ve karidese bayıldık. Gün batımında orada olursanız çok şanslısınız. Kalabalık olmasına rağmen servis hızlı.',
  },
  {
    id: '5',
    platform: 'google',
    name: 'Yunus Emre Tan',
    designation: 'Google',
    date: '4 hafta önce',
    description:
      'Bir arkadaşımın tavsiyesiyle geldik, en güzel tavsiyelerden biri. Terasın manzarası harika. Can adında Fethiyeli bir arkadaş ilgilendi, kendi yerimizmiş gibi hissettirdi. Tavsiye ederim.',
  },
  {
    id: '6',
    platform: 'google',
    name: 'Sue Bali',
    lang: 'en',
    designation: 'Google',
    date: '1 ay önce',
    description:
      'We had fish soup full of fish and absolutely delicious. The free warm bread was amazing too. Seafood salad, calamari, garlic prawns and a grouper skewer — all so fresh and tasty. Will definitely be back soon.',
  },
];
