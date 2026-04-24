export type GalleryItem = {
  id: string;
  name: string;
  description: string;
};

export type GallerySection = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  featured: GalleryItem[];
  list: GalleryItem[];
};

const PLACEHOLDER_DESCRIPTION = `Bu öğeye özgü 2-3 paragraflık bir hikaye burada yer alacak. Tabağın, anın ya da yerin nasıl oluştuğunu; hangi malzemeden, hangi tezgâhtan, hangi insandan beslendiğini anlatan bir metin.

Bir sonraki paragraf mekân, tarih veya yöntem detaylarına girer. Sıfat yığmadan, duyusal dille.

Son paragraf okuyucuya bir davet: ziyaret et, sor, dene.`;

function item(id: string, name: string): GalleryItem {
  return { id, name, description: PLACEHOLDER_DESCRIPTION };
}

export const YEMEKLER: GallerySection = {
  id: 'yemekler',
  eyebrow: 'The Craft',
  title: 'Tabaklar',
  subtitle: '80 tabak, her biri bir hikaye.',
  featured: [
    item('ahtapot-izgara', 'Ahtapot Izgara'),
    item('lagos-komurde', 'Lagos Kömürde'),
    item('istakoz-signature', 'Signature İstakoz'),
    item('kalamar-dolma', 'Kalamar Dolma'),
    item('levrek-marine', 'Levrek Marine'),
  ],
  list: [
    item('kalamar-tava', 'Kalamar Tava'),
    item('karides-tuzlama', 'Karides Tuzlama'),
    item('midye-tava', 'Midye Tava'),
    item('fava', 'Fava'),
    item('ciroz-salatasi', 'Çiroz Salatası'),
    item('lakerda', 'Lakerda'),
    item('balik-corbasi', 'Balık Çorbası'),
    item('balik-bugulama', 'Balık Buğulama'),
    item('balik-pilakisi', 'Balık Pilakisi'),
    item('tarama', 'Tarama'),
    item('lufer-izgara', 'Lüfer Izgara'),
    item('cipura-izgara', 'Çipura Izgara'),
    item('levrek-izgara', 'Levrek Izgara'),
    item('palamut-izgara', 'Palamut Izgara'),
    item('mercan-izgara', 'Mercan Izgara'),
    item('barbun-tava', 'Barbun Tava'),
    item('kalkan-izgara', 'Kalkan Izgara'),
    item('lagos-bugulama', 'Lagos Buğulama'),
    item('iskorpit-izgara', 'İskorpit Izgara'),
    item('karides-guvec', 'Karides Güveç'),
    item('midye-dolma', 'Midye Dolma'),
    item('deniz-borulcesi', 'Deniz Börülcesi'),
    item('semizotu', 'Semizotu'),
    item('haydari', 'Haydari'),
    item('cacik', 'Cacık'),
    item('humus', 'Humus'),
    item('babaganus', 'Babaganuş'),
    item('muhammara', 'Muhammara'),
    item('saksuka', 'Şakşuka'),
    item('sigara-boregi', 'Sigara Böreği'),
    item('zeytinyagli-pirasa', 'Zeytinyağlı Pırasa'),
    item('zeytinyagli-enginar', 'Zeytinyağlı Enginar'),
    item('roka-salatasi', 'Roka Salatası'),
    item('mevsim-salatasi', 'Mevsim Salatası'),
    item('akdeniz-salatasi', 'Akdeniz Salatası'),
    item('karides-kokorec', 'Karides Kokoreç'),
    item('balik-tava', 'Balık Tava'),
    item('feslegenli-domates', 'Fesleğenli Domates'),
    item('cevizli-biber', 'Cevizli Biber'),
    item('antep-ezmesi', 'Antep Ezmesi'),
    item('cerkez-tavugu', 'Çerkez Tavuğu'),
    item('topik', 'Topik'),
    item('sogan-piyazi', 'Soğan Piyazı'),
    item('patlican-salatasi', 'Patlıcan Salatası'),
    item('sarigoz-izgara', 'Sarıgöz Izgara'),
    item('fangri-izgara', 'Fangri Izgara'),
    item('tranca-izgara', 'Trança Izgara'),
    item('mercan-bugulama', 'Mercan Buğulama'),
    item('istavrit-tava', 'İstavrit Tava'),
    item('hamsi-tava', 'Hamsi Tava'),
  ],
};

export const EKIP: GallerySection = {
  id: 'ekip',
  eyebrow: 'Behind the Scenes',
  title: 'Ekip',
  featured: [
    item('mehmet-usta', 'Mehmet Usta — Baş Aşçı'),
    item('ali-agabey', 'Ali Ağabey — Balıkçı'),
    item('ayse-teyze', 'Ayşe Teyze — Mezeci'),
    item('ekrem-garson-sef', 'Ekrem — Garson Şef'),
    item('fatma-hanim', 'Fatma Hanım — Mutfak'),
  ],
  list: [
    item('salih-firinci', 'Salih — Fırıncı'),
    item('hasan-izgaraci', 'Hasan — Izgaracı'),
    item('emin-bulasikci', 'Emin — Bulaşıkçı'),
    item('seda-garson', 'Seda — Garson'),
    item('burak-garson', 'Burak — Garson'),
    item('ismail-kasiyer', 'İsmail — Kasiyer'),
    item('ahmet-tekne', 'Ahmet — Tekne Ustası'),
    item('zeynep-pastaci', 'Zeynep — Pastacı'),
    item('can-sommelier', 'Can — Sommelier'),
    item('derya-host', 'Derya — Host'),
  ],
};

export const MEKAN: GallerySection = {
  id: 'mekan',
  eyebrow: 'The Space',
  title: 'Mekân',
  featured: [
    item('ana-salon', 'Deniz Manzaralı Ana Salon'),
    item('bati-teras', 'Terasın Batıya Bakan Bölümü'),
    item('balikci-masasi', 'Balıkçı Masası'),
    item('ozel-oda', 'Özel Oda'),
    item('sarap-duvari', 'Şarap Duvarı'),
  ],
  list: [
    item('acik-mutfak', 'Açık Mutfak'),
    item('giris-koridoru', 'Giriş Koridoru'),
    item('bahce', 'Bahçe Bölümü'),
    item('kis-bahcesi', 'Kış Bahçesi'),
    item('kutuphane-kose', 'Kütüphane Köşesi'),
    item('sahil-sofrasi', 'Sahil Sofrası'),
    item('cati-terasi', 'Çatı Terası'),
    item('gun-batimi-kose', 'Gün Batımı Köşesi'),
  ],
};

export const ATMOSFER: GallerySection = {
  id: 'atmosfer',
  eyebrow: 'The Moments',
  title: 'Anlar',
  featured: [
    item('aksam-servisi', 'Akşam Yemeği Servisi'),
    item('gun-batimi-masasi', 'Gün Batımı Masası'),
    item('aile-toplantisi', 'Aile Toplantısı'),
    item('yildonumu', 'Yıldönümü Gecesi'),
    item('cumartesi-aksami', 'Cumartesi Akşamı'),
  ],
  list: [
    item('pazar-kahvaltisi', 'Pazar Kahvaltısı'),
    item('sabah-servisi', 'Sabah Servisi'),
    item('yaz-gecesi', 'Yaz Gecesi'),
    item('ozel-gece', 'Özel Gece'),
    item('dost-toplantisi', 'Dost Toplantısı'),
    item('dugun-ardi-sofra', 'Düğün Sonrası Sofra'),
    item('sessiz-ogle', 'Sessiz Öğle'),
    item('festival-aksami', 'Festival Akşamı'),
  ],
};

export const GALLERY_DATA: GallerySection[] = [YEMEKLER, EKIP, MEKAN, ATMOSFER];
