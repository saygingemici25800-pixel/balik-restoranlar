export type MenuItem = {
  name: string;
  description?: string;
  photoUrl?: string;
  videoUrl?: string;
  longDescription?: string;
  price?: string;
  /** Fiyat birimi. 'kg' -> "kg <price>" gösterilir; varsayılan 'portion'. */
  unit?: 'kg' | 'portion';
  /** Fiyatı henüz girilmemiş ürün: canlıda gösterilmez (MENU_DATA'da filtrelenir). */
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

function spotlightItem(
  name: string,
  description: string,
  longDescription: string,
  photoUrl?: string,
  price?: string,
): MenuItem {
  return { name, description, longDescription, photoUrl, price };
}

function listItem(
  name: string,
  longDescription: string,
  price?: string,
): MenuItem {
  return { name, longDescription, price };
}

// Fiyatı henüz girilmemiş yeni ürün: medya bağlı ama canlıda gizli (hidden).
// MENU_DATA, hidden öğeleri filtreler; fiyat girilip hidden kaldırılınca görünür.
function hiddenItem(name: string, longDescription: string): MenuItem {
  return { name, longDescription, hidden: true };
}

const LONG = {
  corbaSpot: 'Sıcak başlangıç. Mevsimin tazesinden, ev usulü pişirilir.',
  corbaList: 'Klasik tarif, sıcak servis.',
  mezeSpot:
    'Soğuk meze tabaklarımızdan, ev yapımı. Paylaşmak için ideal.',
  mezeList: 'Klasik soğuk meze, günlük hazırlanır.',
  ordovrSpot:
    'Mevsimin en iyilerinden seçilmiş bir tabak. Sofranın ortasında paylaşılır.',
  denizMezeSpot:
    'Tezgâhtan seçilen taze deniz mahsulleri. Hafif soslarla, soğuk servis.',
  denizMezeList: 'Tezgâhın tazesinden, soğuk meze.',
  lokumSpot:
    "Çalış'ın imza tabağı. Levrek üzerine kurulu özel bir tarif.",
  araSpot:
    'Sıcak servis edilen ara tabağı. Mangaldan ya da tavadan, taze çıkar.',
  araList: 'Klasik ara sıcak, sipariş üzerine.',
  salataSpot:
    'Mevsim sebzeleri ve tazelik bir arada. Çalış zeytinyağıyla.',
  salataList: 'Mevsim salatası, taze.',
  porsiyonSpot:
    'Günlük tezgâhtan, ızgarada veya tavada hazırlanır. Limon ve ot eşliğinde.',
  porsiyonList: 'Günün tezgâhından, ızgara ya da tava.',
  sezonSpot:
    'Mevsimin balığı, sabah tezgâhtan. Pişirme tercihi sizin.',
  sezonList: 'Sezonun balığı, taze tezgâhtan.',
  etSpot: 'Sahil sofrasının et alternatifi. Özenle pişirilir.',
  etList: 'Et alternatifi, sıcak servis.',
  tatliSpot:
    'Geleneksel Türk tatlısı, ev usulü. Yemek sonrası hafif bir kapanış.',
  tatliList: 'Klasik tatlı, ev usulü.',
};

export const CORBA: MenuSection = {
  id: 'corba',
  eyebrow: 'ÇORBA',
  title: 'Çorbalar',
  listLabel: '— Tüm Çorbalar —',
  spotlight: [
    spotlightItem(
      'Balık Çorbası',
      'Günün taze balığından, hafif kremalı. Limon damlası bekler.',
      'Günün taze balığından çıkarılan stokla pişen, hafifçe limonlanmış sıcak başlangıç. Tezgâhın özü, ilk kaşıkta dile gelen şey.',
      'https://images.unsplash.com/photo-1609355108742-dcbc6c51a3a3?q=80&w=987&auto=format&fit=crop',
      '350 ₺',
    ),
  ],
  fullList: [],
};

export const YOGURTLU_MEZELER: MenuSection = {
  id: 'yogurtlu-mezeler',
  eyebrow: 'YOĞURTLU MEZELER',
  title: 'Yoğurtlu Mezeler',
  listLabel: '— Tüm Yoğurtlu Mezeler —',
  spotlight: [
    spotlightItem(
      'Atom',
      "Süzme yoğurt, közlenmiş biber, sarımsak. Çalış'ın klasiklerinden.",
      'Süzme yoğurt, közlenmiş kuru biber ve cevizin sıcak tereyağıyla buluşması. Acımtırak ve dolgun, rakının yanında parlayan bir başlangıç.',
      'https://images.unsplash.com/photo-1777199264017-84af9308a41f?q=80&w=2070&auto=format&fit=crop',
      '340 ₺',
    ),
    spotlightItem(
      'Cacık',
      'Süzme yoğurt, salatalık ve nane. Soğuk servis.',
      'İnce doğranmış salatalık, dövülmüş sarımsak ve taze nanenin yoğurttaki serin uyumu. Yaz öğlenleri için hafif, ferahlatıcı bir başlangıç.',
      'https://images.unsplash.com/photo-1687540953277-2ead6ffb3a1c?q=80&w=927&auto=format&fit=crop',
      '300 ₺',
    ),
    spotlightItem(
      'Haydari',
      'Kıvamlı yoğurt, taze otlar ve sarımsak.',
      LONG.mezeSpot,
      undefined,
      '300 ₺',
    ),
  ],
  fullList: [
    listItem('Akdeniz', LONG.mezeList, '320 ₺'),
    listItem('Havuç Tarator', LONG.mezeList, '320 ₺'),
    listItem('Girit Güzeli', LONG.mezeList, '350 ₺'),
    listItem('Köpoğlu', LONG.mezeList, '310 ₺'),
    listItem('Yoğurtlu Semizotu', LONG.mezeList, '310 ₺'),
    hiddenItem('Yoğurtlu Meze', LONG.mezeList),
    listItem('Bademli Havuç Tarator', LONG.mezeList, '320 ₺'),
  ],
};

export const SEBZELI_MEZELER: MenuSection = {
  id: 'sebzeli-mezeler',
  eyebrow: 'SEBZELİ MEZELER',
  title: 'Sebzeli Mezeler',
  listLabel: '— Tüm Sebzeli Mezeler —',
  spotlight: [
    spotlightItem(
      'Şakşuka',
      'Patlıcan, biber, domates. Hafif zeytinyağıyla soğutulur.',
      LONG.mezeSpot,
      undefined,
      '300 ₺',
    ),
    spotlightItem(
      'Tahinli Köz Patlıcan',
      'Köz patlıcan, tahinle çırpılır. Üzerine zeytinyağı.',
      'Açık ateşte közlenen patlıcanın dumanlı tadı, tahin ve sarımsakla yoğrulur. Pürüzsüz, bal kıvamında, ekmek banılacak bir tabak.',
      'https://images.unsplash.com/photo-1740077975984-f2670ed698d9?q=80&w=2070&auto=format&fit=crop',
      '300 ₺',
    ),
    spotlightItem(
      'Antep Acılı Ezme',
      'İnce kıyılmış sebzeler, isot ve nar. Ekmeğe yayılır.',
      LONG.mezeSpot,
      undefined,
      '300 ₺',
    ),
    spotlightItem(
      'Avokado Meze',
      'Olgun avokado, limon ve taze ot. Hafif bir başlangıç.',
      'Olgun avokadonun limon ve zeytinyağıyla ezildiği, ev usulü bir mezemiz. Hafif ve doyurucu, sahil sofrasının yeni klasiği.',
      'https://images.unsplash.com/photo-1680364344159-eea9659b843f?q=80&w=2071&auto=format&fit=crop',
      '390 ₺',
    ),
  ],
  fullList: [
    listItem('Patlıcan Salata', LONG.mezeList, '300 ₺'),
    listItem('Special House', LONG.mezeList, '300 ₺'),
    listItem('Deniz Börülcesi', LONG.mezeList, '330 ₺'),
    listItem('Pancar', LONG.mezeList, '300 ₺'),
    listItem('Kaya Koruğu', LONG.mezeList, '300 ₺'),
    listItem('Zeytinyağlı Enginar', LONG.mezeList, '420 ₺'),
    listItem('Brokoli', LONG.mezeList, '300 ₺'),
    listItem('Köz Biber', LONG.mezeList, '300 ₺'),
    listItem('Karışık Ot Tabağı', LONG.mezeList, '340 ₺'),
    listItem('Patlıcan Dövme', LONG.mezeList, '300 ₺'),
    listItem('Etli Yaprak Sarması', LONG.mezeList, '450 ₺'),
    listItem('Yunan Ezmesi', LONG.mezeList, '350 ₺'),
    listItem('Yunan Mezesi', LONG.mezeList, '350 ₺'),
    listItem('Zeytinyağlı Kereviz', LONG.mezeList, '300 ₺'),
    listItem('Mevsim Meze', LONG.mezeList, '300 ₺'),
    listItem('Kıbrıs Mezesi', LONG.mezeList, '350 ₺'),
  ],
};

export const BAKLIYATLI_MEZELER: MenuSection = {
  id: 'bakliyatli-mezeler',
  eyebrow: 'BAKLİYATLI MEZELER',
  title: 'Bakliyatlı Mezeler',
  listLabel: '— Tüm Bakliyatlı Mezeler —',
  spotlight: [
    spotlightItem(
      'Fava',
      'Sarı bezelye püresi, dereotu ve zeytinyağı.',
      "Suda tatlanmış iç bakla püresi, soğuk soğuk dilimlenip dereotuyla servis edilir. Çalış'ın geleneksel başlangıcı, zeytinyağı dökülerek yenir.",
      'https://images.unsplash.com/photo-1680990999782-ba7fe26e4d0b?q=80&w=1910&auto=format&fit=crop',
      '320 ₺',
    ),
    spotlightItem(
      'Humus',
      'Nohut ve tahin, sade ve doyurucu.',
      'Nohut ve tahinin limonla buluştuğu, sumakla bezenen Akdeniz klasiği. Ekmek, krudite ya da çıtır pide ile.',
      'https://images.unsplash.com/photo-1753364547864-679728b22c31?q=80&w=987&auto=format&fit=crop',
      '320 ₺',
    ),
    spotlightItem(
      'Cunda',
      'Ada usulü, yoğun lezzetli bakliyat tabağı.',
      'Beyaz fasulyenin soğuk soğuk hazırlanan, sirke ve zeytinyağlı versiyonu. Adasından adına yakışır, yaz mezesi.',
      'https://media.istockphoto.com/id/506470075/photo/bean-salad.webp?a=1&b=1&s=612x612&w=0&k=20&c=qBCeC1Z_2u4gvZu1O3XKe28gUqhDEYXmpOqOzMAuDi0=',
      '340 ₺',
    ),
  ],
  fullList: [
    listItem('Kuru Börülce', LONG.mezeList, '320 ₺'),
    listItem('Izgara Zeytin', LONG.mezeList, '290 ₺'),
    listItem('Yeşil Zeytin', LONG.mezeList, '250 ₺'),
    hiddenItem('Bezirgan', LONG.mezeList),
  ],
};

export const ORDOVR: MenuSection = {
  id: 'ordovr',
  eyebrow: 'ORDÖVR TABAKLARI',
  title: 'Ordövr Tabakları',
  listLabel: '— Tüm Ordövr Tabakları —',
  spotlight: [
    spotlightItem(
      'Sebzeli Ordövr',
      'Mevsim mezelerinden seçki. Bir tabakta paylaşım.',
      LONG.ordovrSpot,
      undefined,
      '830 ₺',
    ),
    spotlightItem(
      'Deniz Ürünleri Ordövr',
      'Tezgâhın deniz tarafından seçki. Soğuk servis.',
      LONG.ordovrSpot,
      undefined,
      '1100 ₺',
    ),
    spotlightItem(
      'Sebze ve Deniz Ürünleri Ordövr',
      'İki dünyayı bir tabakta. Geniş paylaşım için.',
      LONG.ordovrSpot,
      undefined,
      '950 ₺',
    ),
  ],
  fullList: [],
};

export const DENIZ_MAHSULLERI_MEZE: MenuSection = {
  id: 'deniz-mahsulleri-meze',
  eyebrow: 'DENİZ MAHSÜLLERİ MEZE',
  title: 'Deniz Mahsülleri Meze',
  listLabel: '— Tüm Deniz Mahsülleri Mezeleri —',
  spotlight: [
    spotlightItem(
      'Levrek Marin',
      'İnce dilimli levrek, narenciye ile olgunlaşır. Dereotu eşliğinde.',
      LONG.denizMezeSpot,
      undefined,
      '380 ₺',
    ),
    spotlightItem(
      'Ahtapot Salata',
      'Yumuşak haşlanmış ahtapot, zeytinyağı ve limon.',
      LONG.denizMezeSpot,
      undefined,
      '700 ₺',
    ),
    spotlightItem(
      'Hamsi Marin',
      'Sirkede dinlendirilmiş taze hamsi. Klasik.',
      LONG.denizMezeSpot,
      undefined,
      '350 ₺',
    ),
  ],
  fullList: [
    listItem('Fesleğenli Levrek Marin', LONG.denizMezeList, '390 ₺'),
    listItem('Çiroz', LONG.denizMezeList, '390 ₺'),
    listItem('Midye Marin', LONG.denizMezeList, '350 ₺'),
    listItem('Karışık Deniz Mahsülleri Salata', LONG.denizMezeList, '390 ₺'),
    hiddenItem('Karides Marin', LONG.denizMezeList),
    listItem('Kremalı Ahtapot', LONG.denizMezeList, '950 ₺'),
  ],
};

export const SPESIYAL_LEVREK_LOKUM: MenuSection = {
  id: 'spesiyal-levrek-lokum',
  eyebrow: 'SPESİYAL LEVREK LOKUM',
  title: 'Spesiyal Levrek Lokum',
  listLabel: '— Spesiyal Levrek Lokum —',
  spotlight: [
    // TODO: fiyat ekle — kg fiyatı girilecek
    {
      ...spotlightItem(
        'Spesiyal Levrek Lokum',
        "Çalış'ın imzası. Levrek üzerine kurulu özel bir tarif.",
        LONG.lokumSpot,
        undefined,
        '2250 ₺',
      ),
      unit: 'kg',
    },
  ],
  fullList: [],
};

export const ARA_SICAKLAR: MenuSection = {
  id: 'ara-sicaklar',
  eyebrow: 'ARA SICAKLAR',
  title: 'Ara Sıcaklar',
  listLabel: '— Tüm Ara Sıcaklar —',
  spotlight: [
    spotlightItem(
      'Kalamar Izgara',
      'Yumuşak kalamar, mangalda. Limon ve roka eşliğinde.',
      LONG.araSpot,
      undefined,
      '860 ₺',
    ),
    spotlightItem(
      'Karides Tava',
      'Tereyağında pişirilmiş karides. Sıcak ve sade.',
      LONG.araSpot,
      undefined,
      '780 ₺',
    ),
    spotlightItem(
      'Arpa Şehriye, Midye ve Trüf Mantarlı Karışımı',
      'Arpa şehriye, midye ve trüf. Özel bir karışım.',
      LONG.araSpot,
      undefined,
      '530 ₺',
    ),
    spotlightItem(
      'Levrek Simit',
      'Levrek dolgulu simit hamuru. Sıcak servis edilir.',
      LONG.araSpot,
      undefined,
      '470 ₺',
    ),
    spotlightItem(
      'Lezzet Bombası',
      'Adıyla hak veren, yoğun bir tabak. Şefin tercihiyle.',
      LONG.araSpot,
      undefined,
      '420 ₺',
    ),
  ],
  fullList: [
    listItem('Kalamar Tava', LONG.araList, '780 ₺'),
    listItem('Çıtır Karides', LONG.araList, '240 ₺'),
    listItem('Jumbo Karides', LONG.araList, '3350 ₺'),
    listItem('Paçanga Böreği', LONG.araList, '280 ₺'),
    listItem('Balıkçı Böreği', LONG.araList, '320 ₺'),
    listItem('Kadayıflı Levrek Sarma', LONG.araList, '400 ₺'),
    listItem('Bademli Levrek', LONG.araList, '280 ₺'),
    listItem('Anasonlu Levrek', LONG.araList, '280 ₺'),
    listItem('Domates Soslu Patlıcan Pane', LONG.araList, '380 ₺'),
    listItem('Anne Patatesi', LONG.araList, '350 ₺'),
    listItem('Chips', LONG.araList, '280 ₺'),
    listItem('Fish & Chips', LONG.araList, '890 ₺'),
    listItem('Ahtapot Izgara', LONG.araList, '900 ₺'),
    listItem('Ahtapot Tandır', LONG.araList, '950 ₺'),
    listItem('Midye Tava', LONG.araList, '680 ₺'),
    listItem('Şevketi Bostan', LONG.araList, '490 ₺'),
    listItem('Deniz Mahsüllü Şevketi Bostan', LONG.araList, '850 ₺'),
    listItem('Kaşar Mantar', LONG.araList, '100 ₺'),
    listItem('Çıtır Kabak', LONG.araList, '400 ₺'),
    hiddenItem('Çıtır Tabak', LONG.araList),
    listItem('Ekşili Mantar', LONG.araList, '320 ₺'),
    listItem('Izgara Peynir', LONG.araList, '380 ₺'),
  ],
};

export const SALATALAR: MenuSection = {
  id: 'salatalar',
  eyebrow: 'SALATALAR',
  title: 'Salatalar',
  listLabel: '— Tüm Salatalar —',
  spotlight: [
    spotlightItem(
      'Çalış Spesiyal Salatası',
      "Çalış'ın imza salatası. Mevsim malzemelerinin tazesi.",
      LONG.salataSpot,
      undefined,
      '420 ₺',
    ),
    spotlightItem(
      'Gavurdağ Salata',
      'Antep usulü, ince kıyılmış sebzeler ve nar.',
      LONG.salataSpot,
      undefined,
      '390 ₺',
    ),
    spotlightItem(
      'Roka Salata',
      'Taze roka, parmesan ve limon. Sade ve ferah.',
      LONG.salataSpot,
      undefined,
      '380 ₺',
    ),
  ],
  fullList: [
    listItem('Mevsim Salata', LONG.salataList, '380 ₺'),
    listItem('Çoban Salata', LONG.salataList, '380 ₺'),
    listItem('Yeşil Salata', LONG.salataList, '380 ₺'),
    listItem('İstanbul Salata', LONG.salataList, '390 ₺'),
    listItem('Peynirli Mevsim Salata', LONG.salataList, '420 ₺'),
  ],
};

export const BALIKLARIMIZ: MenuSection = {
  id: 'baliklarimiz',
  eyebrow: 'BALIKLARIMIZ',
  title: 'Balıklarımız',
  listLabel: '— Tüm Balıklar —',
  spotlight: [
    spotlightItem(
      'Levrek Izgara',
      'Bütün levrek, mangalda. Limon-ot eşliğinde.',
      LONG.porsiyonSpot,
      undefined,
      '980 ₺',
    ),
    spotlightItem(
      'Çipura Izgara',
      'Bütün çipura, kömür ateşinde.',
      LONG.porsiyonSpot,
      undefined,
      '980 ₺',
    ),
    spotlightItem(
      'Somon Izgara',
      'İri somon dilimi, ızgarada hafif pişirilir.',
      LONG.porsiyonSpot,
      undefined,
      '880 ₺',
    ),
    spotlightItem(
      'Lagos Izgara',
      'Beyaz etli lagos, mangalda. Sezonun değerlilerinden.',
      LONG.porsiyonSpot,
      undefined,
      '2950 ₺',
    ),
  ],
  fullList: [
    listItem('Dil Şiş', LONG.porsiyonList, '980 ₺'),
    listItem('Lagos Şiş', LONG.porsiyonList, '800 ₺'),
    listItem('Somon Şiş', LONG.porsiyonList, '850 ₺'),
    { ...listItem('Barbun Tava / Izgara', LONG.porsiyonList, '3250 ₺'), unit: 'kg' },
    listItem('Balık Şaşlık', LONG.porsiyonList, '730 ₺'),
    listItem('Balık Kavurma', LONG.porsiyonList, '850 ₺'),
    // Bütün balıklar — kg fiyatıyla (günlük).
    { ...listItem('Lüfer', LONG.sezonList, '2800 ₺'), unit: 'kg' },
    { ...listItem('Minekop', LONG.sezonList, '2150 ₺'), unit: 'kg' },
    { ...listItem('Fangri', LONG.sezonList, '2480 ₺'), unit: 'kg' },
    { ...listItem('Akya', LONG.sezonList, '2150 ₺'), unit: 'kg' },
    { ...listItem('Mercan', LONG.sezonList, '2400 ₺'), unit: 'kg' },
    { ...listItem('Kaya Levreği', LONG.sezonList, '2250 ₺'), unit: 'kg' },
  ],
};

export const BEYAZ_KIRMIZI_ET: MenuSection = {
  id: 'beyaz-kirmizi-et',
  eyebrow: 'BEYAZ VE KIRMIZI ET',
  title: 'Beyaz ve Kırmızı Et',
  listLabel: '— Tüm Et Çeşitleri —',
  spotlight: [
    spotlightItem(
      'Kuzu Şiş',
      'Marine kuzu, mangalda. Köz biber eşliğinde.',
      LONG.etSpot,
      undefined,
      '1100 ₺',
    ),
    spotlightItem(
      'Antrikot',
      'Izgara antrikot, dinlendirilmiş. Tereyağı ve kekik.',
      LONG.etSpot,
      undefined,
      '1750 ₺',
    ),
    // NOT: Köfte SİL listesinde değildi; mevcut hali (380 ₺ + izgara-kofte video)
    // korundu. "media yok / Güncel fiyat" istenirse rapordaki seçeneklere bak.
    spotlightItem(
      'Köfte',
      'Klasik el yapımı köfte, mangalda.',
      LONG.etSpot,
      undefined,
      '750 ₺',
    ),
    spotlightItem(
      'Tavuk Şiş',
      'Marine tavuk şiş, kömür ateşinde.',
      LONG.etSpot,
      undefined,
      '680 ₺',
    ),
  ],
  fullList: [],
};

export const TATLI: MenuSection = {
  id: 'tatli',
  eyebrow: 'TATLI ÇEŞİTLERİ',
  title: 'Tatlı Çeşitleri',
  listLabel: '— Tüm Tatlılar —',
  spotlight: [
    spotlightItem(
      'Kabak Tatlısı',
      'Tahin ve cevizle. Geleneksel ev usulü.',
      LONG.tatliSpot,
      undefined,
      '330 ₺',
    ),
    spotlightItem(
      'Ekmek Kadayıfı',
      'Şerbette dinlenmiş kadayıf. Kaymakla.',
      LONG.tatliSpot,
      undefined,
      '180 ₺',
    ),
    spotlightItem(
      'İncir Tatlısı',
      'Kuru incir, ceviz dolgulu. Şerbetiyle servis.',
      LONG.tatliSpot,
      undefined,
      '160 ₺',
    ),
  ],
  fullList: [
    listItem('Ayva Tatlısı', LONG.tatliList, '350 ₺'),
    listItem('Kazandibi', LONG.tatliList, '360 ₺'),
    listItem('Sufle', LONG.tatliList, '390 ₺'),
    listItem('Balmadem', LONG.tatliList, '140 ₺'),
    listItem('Fırın Helva', LONG.tatliList, '350 ₺'),
    listItem('Dondurmalı İrmik', LONG.tatliList, '330 ₺'),
  ],
};

// Poster public/menu/<slug>.webp, video R2 public bucket'tan <slug>.mp4 olarak gelir.
const R2_MENU_BASE =
  'https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev/menu';

// Ürün adı -> medya slug eşlemesi. Tek doğruluk kaynağı: yeni çekim geldikçe
// buraya bir satır eklenir, eşleşen ürün otomatik poster + video alır.
const MENU_MEDIA: Record<string, string> = {
  'Antep Acılı Ezme': 'antep-ezme',
  Atom: 'atom',
  'Balık Çorbası': 'balik-corbasi',
  'Balıkçı Böreği': 'balikci-boregi',
  Brokoli: 'brokoli',
  Cacık: 'cacik',
  'Çalış Spesiyal Salatası': 'calis-special',
  Çiroz: 'ciroz',
  'Şevketi Bostan': 'citir-sevketi-bostan',
  'Çipura Izgara': 'cupra-izgara',
  'Deniz Börülcesi': 'deniz-borulcesi',
  Pancar: 'elmali-pancar',
  'Zeytinyağlı Enginar': 'enginar',
  Fava: 'fava-tekmil',
  'Havuç Tarator': 'havuc-tarator',
  Haydari: 'haydari',
  Köfte: 'izgara-kofte',
  'Izgara Zeytin': 'izgara-zeytin',
  'Kalamar Izgara': 'kalamar-izgara',
  'Kalamar Tava': 'kalamar-tava',
  'Karides Tava': 'karide-tava',
  'Karışık Deniz Mahsülleri Salata': 'karisik-deniz-mahsulu',
  'Karışık Ot Tabağı': 'karisik-ot',
  'Kaya Koruğu': 'kaya-korugu',
  'Lagos Şiş': 'lahos-sis',
  'Spesiyal Levrek Lokum': 'levrek-lokum',
  'Levrek Marin': 'levrek-marin',
  'Levrek Simit': 'levrek-simit',
  'Lezzet Bombası': 'lezzet-bombasi',
  'Mevsim Salata': 'mevsim-salata',
  'Patlıcan Salata': 'patlican-salatasi',
  Şakşuka: 'saksuka',
  // Kurtarılan — mevcut ürünlere bağlandı
  'Ahtapot Izgara': 'ahtapot-izgara',
  'Köz Biber': 'koz-biber',
  'Yoğurtlu Semizotu': 'yogurtlu-sicak-ot',
  // Yeni ürünler (fiyatsız/hidden) — medya staged
  'Çıtır Kabak': 'citir-kabak',
  'Çıtır Tabak': 'citir-tabak',
  'Ekşili Mantar': 'eksili-mantar',
  'Izgara Peynir': 'izgara-peynir',
  'Yoğurtlu Meze': 'yogurtlu-meze',
  'Bademli Havuç Tarator': 'bademli-havuc-tarator',
  'Patlıcan Dövme': 'patlican-dovme',
  'Etli Yaprak Sarması': 'yaprak-sarmasi',
  'Yunan Ezmesi': 'yunan-ezmesi',
  'Yunan Mezesi': 'yunan-mezesi',
  'Zeytinyağlı Kereviz': 'zeytinyagli-kereviz',
  'Mevsim Meze': 'mevsim-meze',
  'Kıbrıs Mezesi': 'kibris-meze',
  Bezirgan: 'bezirgan',
  'Karides Marin': 'karides-marin',
  'Kremalı Ahtapot': 'kremali-ahtapot',
  'Peynirli Mevsim Salata': 'peynirli-mevsim-salata',
};

function withMedia(item: MenuItem): MenuItem {
  const slug = MENU_MEDIA[item.name];
  if (!slug) return item;
  return {
    ...item,
    photoUrl: `/menu/${slug}.webp`,
    videoUrl: `${R2_MENU_BASE}/${slug}.mp4`,
  };
}

function applyMedia(section: MenuSection): MenuSection {
  return {
    ...section,
    spotlight: section.spotlight.map(withMedia),
    fullList: section.fullList.map(withMedia),
  };
}

// Fiyatsız (hidden) ürünleri canlı menüden çıkarır. Tanımları yukarıda durur;
// fiyat girilip hidden kaldırılınca otomatik görünür hale gelir.
function stripHidden(section: MenuSection): MenuSection {
  return {
    ...section,
    spotlight: section.spotlight.filter((i) => !i.hidden),
    fullList: section.fullList.filter((i) => !i.hidden),
  };
}

export const MENU_DATA: MenuSection[] = [
  CORBA,
  YOGURTLU_MEZELER,
  SEBZELI_MEZELER,
  BAKLIYATLI_MEZELER,
  ORDOVR,
  DENIZ_MAHSULLERI_MEZE,
  SPESIYAL_LEVREK_LOKUM,
  ARA_SICAKLAR,
  SALATALAR,
  BALIKLARIMIZ,
  BEYAZ_KIRMIZI_ET,
  TATLI,
]
  .map(applyMedia)
  .map(stripHidden);
