export type MenuItem = {
  name: string;
  description?: string;
  photoUrl?: string;
  longDescription?: string;
  priceRange?: string;
};

export type MenuSection = {
  id: string;
  eyebrow: string;
  title: string;
  listLabel: string;
  spotlight: MenuItem[];
  fullList: MenuItem[];
  priceNote?: string;
};

function spotlightItem(
  name: string,
  description: string,
  longDescription: string,
  photoUrl?: string,
  priceRange?: string,
): MenuItem {
  return { name, description, longDescription, photoUrl, priceRange };
}

function listItem(
  name: string,
  longDescription: string,
  priceRange?: string,
): MenuItem {
  return { name, longDescription, priceRange };
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
    ),
    spotlightItem(
      'Günün Çorbası',
      'Tezgâhın o günkü tercihi. Mevsime göre değişir.',
      'Mevsimin getirdiğine göre değişen, mutfaktan o güne özel çıkan çorba. Sürpriz seven sofralar için.',
      'https://images.unsplash.com/photo-1616501268209-edfff098fdd2?q=80&w=987&auto=format&fit=crop',
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
    ),
    spotlightItem(
      'Cacık',
      'Süzme yoğurt, salatalık ve nane. Soğuk servis.',
      'İnce doğranmış salatalık, dövülmüş sarımsak ve taze nanenin yoğurttaki serin uyumu. Yaz öğlenleri için hafif, ferahlatıcı bir başlangıç.',
      'https://images.unsplash.com/photo-1687540953277-2ead6ffb3a1c?q=80&w=927&auto=format&fit=crop',
    ),
    spotlightItem(
      'Haydari',
      'Kıvamlı yoğurt, taze otlar ve sarımsak.',
      LONG.mezeSpot,
    ),
  ],
  fullList: [
    listItem('Akdeniz', LONG.mezeList),
    listItem('Havuç Tarator', LONG.mezeList),
    listItem('Girit Güzeli', LONG.mezeList),
    listItem('Köpoğlu', LONG.mezeList),
    listItem('Yoğurtlu Semizotu', LONG.mezeList),
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
    ),
    spotlightItem(
      'Tahinli Köz Patlıcan',
      'Köz patlıcan, tahinle çırpılır. Üzerine zeytinyağı.',
      'Açık ateşte közlenen patlıcanın dumanlı tadı, tahin ve sarımsakla yoğrulur. Pürüzsüz, bal kıvamında, ekmek banılacak bir tabak.',
      'https://images.unsplash.com/photo-1740077975984-f2670ed698d9?q=80&w=2070&auto=format&fit=crop',
    ),
    spotlightItem(
      'Antep Acılı Ezme',
      'İnce kıyılmış sebzeler, isot ve nar. Ekmeğe yayılır.',
      LONG.mezeSpot,
    ),
    spotlightItem(
      'Avokado Meze',
      'Olgun avokado, limon ve taze ot. Hafif bir başlangıç.',
      'Olgun avokadonun limon ve zeytinyağıyla ezildiği, ev usulü bir mezemiz. Hafif ve doyurucu, sahil sofrasının yeni klasiği.',
      'https://images.unsplash.com/photo-1680364344159-eea9659b843f?q=80&w=2071&auto=format&fit=crop',
    ),
  ],
  fullList: [
    listItem('Patlıcan Salata', LONG.mezeList),
    listItem('Special House', LONG.mezeList),
    listItem('Deniz Börülcesi', LONG.mezeList),
    listItem('Pancar', LONG.mezeList),
    listItem('Kaya Koruğu', LONG.mezeList),
    listItem('Zeytinyağlı Enginar', LONG.mezeList),
    listItem('Brokoli', LONG.mezeList),
    listItem('Köz Biber', LONG.mezeList),
    listItem('Karışık Ot Tabağı', LONG.mezeList),
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
    ),
    spotlightItem(
      'Humus',
      'Nohut ve tahin, sade ve doyurucu.',
      'Nohut ve tahinin limonla buluştuğu, sumakla bezenen Akdeniz klasiği. Ekmek, krudite ya da çıtır pide ile.',
      'https://images.unsplash.com/photo-1753364547864-679728b22c31?q=80&w=987&auto=format&fit=crop',
    ),
    spotlightItem(
      'Cunda',
      'Ada usulü, yoğun lezzetli bakliyat tabağı.',
      'Beyaz fasulyenin soğuk soğuk hazırlanan, sirke ve zeytinyağlı versiyonu. Adasından adına yakışır, yaz mezesi.',
      'https://media.istockphoto.com/id/506470075/photo/bean-salad.webp?a=1&b=1&s=612x612&w=0&k=20&c=qBCeC1Z_2u4gvZu1O3XKe28gUqhDEYXmpOqOzMAuDi0=',
    ),
  ],
  fullList: [
    listItem('Kuru Börülce', LONG.mezeList),
    listItem('Izgara Zeytin', LONG.mezeList),
    listItem('Yeşil Zeytin', LONG.mezeList),
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
    ),
    spotlightItem(
      'Deniz Ürünleri Ordövr',
      'Tezgâhın deniz tarafından seçki. Soğuk servis.',
      LONG.ordovrSpot,
    ),
    spotlightItem(
      'Sebze ve Deniz Ürünleri Ordövr',
      'İki dünyayı bir tabakta. Geniş paylaşım için.',
      LONG.ordovrSpot,
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
    ),
    spotlightItem(
      'Ahtapot Salata',
      'Yumuşak haşlanmış ahtapot, zeytinyağı ve limon.',
      LONG.denizMezeSpot,
    ),
    spotlightItem(
      'Hamsi Marin',
      'Sirkede dinlendirilmiş taze hamsi. Klasik.',
      LONG.denizMezeSpot,
    ),
  ],
  fullList: [
    listItem('Fesleğenli Levrek Marin', LONG.denizMezeList),
    listItem('Çiroz', LONG.denizMezeList),
    listItem('Midye Marin', LONG.denizMezeList),
    listItem('Karışık Deniz Mahsülleri Salata', LONG.denizMezeList),
  ],
};

export const SPESIYAL_LEVREK_LOKUM: MenuSection = {
  id: 'spesiyal-levrek-lokum',
  eyebrow: 'SPESİYAL LEVREK LOKUM',
  title: 'Spesiyal Levrek Lokum',
  listLabel: '— Tüm Spesiyal Levrek Lokumlar —',
  spotlight: [
    spotlightItem(
      'Spesiyal Levrek Lokum 1',
      "Çalış'ın imzası, ilk versiyon. Levrek üzerine özgün bir kompozisyon.",
      LONG.lokumSpot,
    ),
    spotlightItem(
      'Spesiyal Levrek Lokum 2',
      'İmza tabağın ikinci yorumu. Detayda farklı, ruhta aynı.',
      LONG.lokumSpot,
    ),
    spotlightItem(
      'Spesiyal Levrek Lokum 3',
      'Üçüncü versiyon. Sezon dokunuşlarıyla.',
      LONG.lokumSpot,
    ),
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
    ),
    spotlightItem(
      'Karides Tava',
      'Tereyağında pişirilmiş karides. Sıcak ve sade.',
      LONG.araSpot,
    ),
    spotlightItem(
      'Arpa Şehriye, Midye ve Trüf Mantarlı Karışımı',
      'Arpa şehriye, midye ve trüf. Özel bir karışım.',
      LONG.araSpot,
    ),
    spotlightItem(
      'Levrek Simit',
      'Levrek dolgulu simit hamuru. Sıcak servis edilir.',
      LONG.araSpot,
    ),
    spotlightItem(
      'Lezzet Bombası',
      'Adıyla hak veren, yoğun bir tabak. Şefin tercihiyle.',
      LONG.araSpot,
    ),
  ],
  fullList: [
    listItem('Kalamar Tava', LONG.araList),
    listItem('Çıtır Karides', LONG.araList),
    listItem('Jumbo Karides', LONG.araList),
    listItem('Paçanga Böreği', LONG.araList),
    listItem('Balıkçı Böreği', LONG.araList),
    listItem('Patlıcan Kadayıflı Levrek', LONG.araList),
    listItem('Bademli Levrek', LONG.araList),
    listItem('Anasonlu Levrek', LONG.araList),
    listItem('Domates Soslu Patlıcan Pane', LONG.araList),
    listItem('Anne Patatesi', LONG.araList),
    listItem('Chips', LONG.araList),
    listItem('Fish & Chips', LONG.araList),
    listItem('Ahtapot Izgara', LONG.araList),
    listItem('Ahtapot Tandır', LONG.araList),
    listItem('Midye Tava', LONG.araList),
    listItem('Şevketi Bostan', LONG.araList),
    listItem('Deniz Mahsüllü Şevketi Bostan', LONG.araList),
    listItem('Kaşar Mantar', LONG.araList),
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
    ),
    spotlightItem(
      'Gavurdağ Salata',
      'Antep usulü, ince kıyılmış sebzeler ve nar.',
      LONG.salataSpot,
    ),
    spotlightItem(
      'Roka Salata',
      'Taze roka, parmesan ve limon. Sade ve ferah.',
      LONG.salataSpot,
    ),
  ],
  fullList: [
    listItem('Mevsim Salata', LONG.salataList),
    listItem('Çoban Salata', LONG.salataList),
    listItem('Yeşil Salata', LONG.salataList),
    listItem('İstanbul Salata', LONG.salataList),
  ],
};

export const PORSIYON_BALIK: MenuSection = {
  id: 'porsiyon-balik',
  eyebrow: 'PORSİYON BALIK',
  title: 'Porsiyon Balık',
  listLabel: '— Tüm Porsiyon Balıklar —',
  priceNote: 'Fiyat aralığımız her sabah mezattan sonra güncellenir.',
  spotlight: [
    spotlightItem(
      'Levrek Izgara',
      'Bütün levrek, mangalda. Limon-ot eşliğinde.',
      LONG.porsiyonSpot,
      undefined,
      '600 — 650 ₺',
    ),
    spotlightItem(
      'Çipura Izgara',
      'Bütün çipura, kömür ateşinde.',
      LONG.porsiyonSpot,
      undefined,
      '550 — 600 ₺',
    ),
    spotlightItem(
      'Somon Izgara',
      'İri somon dilimi, ızgarada hafif pişirilir.',
      LONG.porsiyonSpot,
      undefined,
      '700 — 800 ₺',
    ),
  ],
  fullList: [
    listItem('Dil Şiş', LONG.porsiyonList, '650 — 750 ₺'),
    listItem('Lagos Şiş', LONG.porsiyonList, '750 — 900 ₺'),
    listItem('Somon Şiş', LONG.porsiyonList, '700 — 800 ₺'),
    listItem('Barbun Tava / Izgara', LONG.porsiyonList, '400 — 500 ₺'),
    listItem('Balık Şaşlık', LONG.porsiyonList, '550 — 650 ₺'),
    listItem('Balık Kavurma', LONG.porsiyonList, '500 — 600 ₺'),
  ],
};

export const SEZON_BALIK: MenuSection = {
  id: 'sezon-balik',
  eyebrow: 'SEZON BALIK ÇEŞİTLERİ',
  title: 'Sezon Balık Çeşitleri',
  listLabel: '— Tüm Sezon Balıkları —',
  priceNote: 'Fiyat aralığımız her sabah mezattan sonra güncellenir.',
  spotlight: [
    spotlightItem(
      'Levrek',
      'Sezonun klasik balığı. Pişirme tercihiniz şefe iletilir.',
      LONG.sezonSpot,
      undefined,
      '600 — 650 ₺',
    ),
    spotlightItem(
      'Çipura',
      'Tezgâhın sevileni. Izgara ya da tava.',
      LONG.sezonSpot,
      undefined,
      '550 — 600 ₺',
    ),
    spotlightItem(
      'Lagos',
      'Beyaz etli, doyurucu. Sezonun değerlilerinden.',
      LONG.sezonSpot,
      undefined,
      '750 — 900 ₺',
    ),
  ],
  fullList: [
    listItem('Lüfer', LONG.sezonList, '700 — 850 ₺'),
    listItem('Minekop', LONG.sezonList, '600 — 750 ₺'),
    listItem('Fangri', LONG.sezonList, '700 — 850 ₺'),
    listItem('Akya', LONG.sezonList, '650 — 800 ₺'),
    listItem('Mercan', LONG.sezonList, '650 — 750 ₺'),
    listItem('Dülger', LONG.sezonList, '700 — 850 ₺'),
    listItem('Barbun', LONG.sezonList, '400 — 500 ₺'),
    listItem('Kılıç', LONG.sezonList, '800 — 950 ₺'),
    listItem('Kaya Levreği', LONG.sezonList, '600 — 700 ₺'),
    listItem('Mezgit', LONG.sezonList, '350 — 450 ₺'),
  ],
};

export const BEYAZ_KIRMIZI_ET: MenuSection = {
  id: 'beyaz-kirmizi-et',
  eyebrow: 'BEYAZ VE KIRMIZI ET',
  title: 'Beyaz ve Kırmızı Et',
  listLabel: '— Tüm Et Çeşitleri —',
  spotlight: [
    spotlightItem(
      'Köfte',
      'Klasik el yapımı köfte, mangalda.',
      LONG.etSpot,
    ),
    spotlightItem(
      'Et Çökertme',
      'İnce dilimli et, yoğurt ve domates eşliğinde.',
      LONG.etSpot,
    ),
    spotlightItem(
      'Tavuk Schnitzel',
      'İnce dövülmüş tavuk, çıtır kaplama. Limonla.',
      LONG.etSpot,
    ),
  ],
  fullList: [
    listItem('Et Şiş', LONG.etList),
    listItem('Tavuk Pırzola', LONG.etList),
    listItem('Sucuklu Pizza', LONG.etList),
    listItem('Margarita Pizza', LONG.etList),
  ],
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
    ),
    spotlightItem(
      'Ekmek Kadayıfı',
      'Şerbette dinlenmiş kadayıf. Kaymakla.',
      LONG.tatliSpot,
    ),
    spotlightItem(
      'İncir Tatlısı',
      'Kuru incir, ceviz dolgulu. Şerbetiyle servis.',
      LONG.tatliSpot,
    ),
  ],
  fullList: [
    listItem('Ayva Tatlısı', LONG.tatliList),
    listItem('Kazandibi', LONG.tatliList),
    listItem('Sufle', LONG.tatliList),
    listItem('Balmadem', LONG.tatliList),
    listItem('Fırın Helva', LONG.tatliList),
    listItem('Dondurmalı İrmik', LONG.tatliList),
  ],
};

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
  PORSIYON_BALIK,
  SEZON_BALIK,
  BEYAZ_KIRMIZI_ET,
  TATLI,
];
