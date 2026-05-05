export type MenuItem = {
  name: string;
  description?: string;
  photoUrl?: string;
  longDescription?: string;
  price?: string;
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
      '150 ₺',
    ),
    spotlightItem(
      'Günün Çorbası',
      'Tezgâhın o günkü tercihi. Mevsime göre değişir.',
      'Mevsimin getirdiğine göre değişen, mutfaktan o güne özel çıkan çorba. Sürpriz seven sofralar için.',
      'https://images.unsplash.com/photo-1616501268209-edfff098fdd2?q=80&w=987&auto=format&fit=crop',
      '110 ₺',
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
      '130 ₺',
    ),
    spotlightItem(
      'Cacık',
      'Süzme yoğurt, salatalık ve nane. Soğuk servis.',
      'İnce doğranmış salatalık, dövülmüş sarımsak ve taze nanenin yoğurttaki serin uyumu. Yaz öğlenleri için hafif, ferahlatıcı bir başlangıç.',
      'https://images.unsplash.com/photo-1687540953277-2ead6ffb3a1c?q=80&w=927&auto=format&fit=crop',
      '95 ₺',
    ),
    spotlightItem(
      'Haydari',
      'Kıvamlı yoğurt, taze otlar ve sarımsak.',
      LONG.mezeSpot,
      undefined,
      '110 ₺',
    ),
  ],
  fullList: [
    listItem('Akdeniz', LONG.mezeList, '130 ₺'),
    listItem('Havuç Tarator', LONG.mezeList, '110 ₺'),
    listItem('Girit Güzeli', LONG.mezeList, '140 ₺'),
    listItem('Köpoğlu', LONG.mezeList, '130 ₺'),
    listItem('Yoğurtlu Semizotu', LONG.mezeList, '120 ₺'),
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
      '120 ₺',
    ),
    spotlightItem(
      'Tahinli Köz Patlıcan',
      'Köz patlıcan, tahinle çırpılır. Üzerine zeytinyağı.',
      'Açık ateşte közlenen patlıcanın dumanlı tadı, tahin ve sarımsakla yoğrulur. Pürüzsüz, bal kıvamında, ekmek banılacak bir tabak.',
      'https://images.unsplash.com/photo-1740077975984-f2670ed698d9?q=80&w=2070&auto=format&fit=crop',
      '140 ₺',
    ),
    spotlightItem(
      'Antep Acılı Ezme',
      'İnce kıyılmış sebzeler, isot ve nar. Ekmeğe yayılır.',
      LONG.mezeSpot,
      undefined,
      '110 ₺',
    ),
    spotlightItem(
      'Avokado Meze',
      'Olgun avokado, limon ve taze ot. Hafif bir başlangıç.',
      'Olgun avokadonun limon ve zeytinyağıyla ezildiği, ev usulü bir mezemiz. Hafif ve doyurucu, sahil sofrasının yeni klasiği.',
      'https://images.unsplash.com/photo-1680364344159-eea9659b843f?q=80&w=2071&auto=format&fit=crop',
      '160 ₺',
    ),
  ],
  fullList: [
    listItem('Patlıcan Salata', LONG.mezeList, '110 ₺'),
    listItem('Special House', LONG.mezeList, '140 ₺'),
    listItem('Deniz Börülcesi', LONG.mezeList, '130 ₺'),
    listItem('Pancar', LONG.mezeList, '100 ₺'),
    listItem('Kaya Koruğu', LONG.mezeList, '120 ₺'),
    listItem('Zeytinyağlı Enginar', LONG.mezeList, '150 ₺'),
    listItem('Brokoli', LONG.mezeList, '110 ₺'),
    listItem('Köz Biber', LONG.mezeList, '100 ₺'),
    listItem('Karışık Ot Tabağı', LONG.mezeList, '130 ₺'),
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
      '110 ₺',
    ),
    spotlightItem(
      'Humus',
      'Nohut ve tahin, sade ve doyurucu.',
      'Nohut ve tahinin limonla buluştuğu, sumakla bezenen Akdeniz klasiği. Ekmek, krudite ya da çıtır pide ile.',
      'https://images.unsplash.com/photo-1753364547864-679728b22c31?q=80&w=987&auto=format&fit=crop',
      '95 ₺',
    ),
    spotlightItem(
      'Cunda',
      'Ada usulü, yoğun lezzetli bakliyat tabağı.',
      'Beyaz fasulyenin soğuk soğuk hazırlanan, sirke ve zeytinyağlı versiyonu. Adasından adına yakışır, yaz mezesi.',
      'https://media.istockphoto.com/id/506470075/photo/bean-salad.webp?a=1&b=1&s=612x612&w=0&k=20&c=qBCeC1Z_2u4gvZu1O3XKe28gUqhDEYXmpOqOzMAuDi0=',
      '130 ₺',
    ),
  ],
  fullList: [
    listItem('Kuru Börülce', LONG.mezeList, '110 ₺'),
    listItem('Izgara Zeytin', LONG.mezeList, '90 ₺'),
    listItem('Yeşil Zeytin', LONG.mezeList, '80 ₺'),
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
      '380 ₺',
    ),
    spotlightItem(
      'Deniz Ürünleri Ordövr',
      'Tezgâhın deniz tarafından seçki. Soğuk servis.',
      LONG.ordovrSpot,
      undefined,
      '550 ₺',
    ),
    spotlightItem(
      'Sebze ve Deniz Ürünleri Ordövr',
      'İki dünyayı bir tabakta. Geniş paylaşım için.',
      LONG.ordovrSpot,
      undefined,
      '580 ₺',
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
      '220 ₺',
    ),
    spotlightItem(
      'Ahtapot Salata',
      'Yumuşak haşlanmış ahtapot, zeytinyağı ve limon.',
      LONG.denizMezeSpot,
      undefined,
      '240 ₺',
    ),
    spotlightItem(
      'Hamsi Marin',
      'Sirkede dinlendirilmiş taze hamsi. Klasik.',
      LONG.denizMezeSpot,
      undefined,
      '160 ₺',
    ),
  ],
  fullList: [
    listItem('Fesleğenli Levrek Marin', LONG.denizMezeList, '230 ₺'),
    listItem('Çiroz', LONG.denizMezeList, '180 ₺'),
    listItem('Midye Marin', LONG.denizMezeList, '170 ₺'),
    listItem('Karışık Deniz Mahsülleri Salata', LONG.denizMezeList, '280 ₺'),
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
      undefined,
      '320 ₺',
    ),
    spotlightItem(
      'Spesiyal Levrek Lokum 2',
      'İmza tabağın ikinci yorumu. Detayda farklı, ruhta aynı.',
      LONG.lokumSpot,
      undefined,
      '340 ₺',
    ),
    spotlightItem(
      'Spesiyal Levrek Lokum 3',
      'Üçüncü versiyon. Sezon dokunuşlarıyla.',
      LONG.lokumSpot,
      undefined,
      '360 ₺',
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
      undefined,
      '240 ₺',
    ),
    spotlightItem(
      'Karides Tava',
      'Tereyağında pişirilmiş karides. Sıcak ve sade.',
      LONG.araSpot,
      undefined,
      '260 ₺',
    ),
    spotlightItem(
      'Arpa Şehriye, Midye ve Trüf Mantarlı Karışımı',
      'Arpa şehriye, midye ve trüf. Özel bir karışım.',
      LONG.araSpot,
      undefined,
      '280 ₺',
    ),
    spotlightItem(
      'Levrek Simit',
      'Levrek dolgulu simit hamuru. Sıcak servis edilir.',
      LONG.araSpot,
      undefined,
      '220 ₺',
    ),
    spotlightItem(
      'Lezzet Bombası',
      'Adıyla hak veren, yoğun bir tabak. Şefin tercihiyle.',
      LONG.araSpot,
      undefined,
      '250 ₺',
    ),
  ],
  fullList: [
    listItem('Kalamar Tava', LONG.araList, '220 ₺'),
    listItem('Çıtır Karides', LONG.araList, '240 ₺'),
    listItem('Jumbo Karides', LONG.araList, '320 ₺'),
    listItem('Paçanga Böreği', LONG.araList, '160 ₺'),
    listItem('Balıkçı Böreği', LONG.araList, '170 ₺'),
    listItem('Patlıcan Kadayıflı Levrek', LONG.araList, '280 ₺'),
    listItem('Bademli Levrek', LONG.araList, '280 ₺'),
    listItem('Anasonlu Levrek', LONG.araList, '280 ₺'),
    listItem('Domates Soslu Patlıcan Pane', LONG.araList, '180 ₺'),
    listItem('Anne Patatesi', LONG.araList, '130 ₺'),
    listItem('Chips', LONG.araList, '110 ₺'),
    listItem('Fish & Chips', LONG.araList, '240 ₺'),
    listItem('Ahtapot Izgara', LONG.araList, '290 ₺'),
    listItem('Ahtapot Tandır', LONG.araList, '310 ₺'),
    listItem('Midye Tava', LONG.araList, '200 ₺'),
    listItem('Şevketi Bostan', LONG.araList, '190 ₺'),
    listItem('Deniz Mahsüllü Şevketi Bostan', LONG.araList, '280 ₺'),
    listItem('Kaşar Mantar', LONG.araList, '160 ₺'),
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
      '180 ₺',
    ),
    spotlightItem(
      'Gavurdağ Salata',
      'Antep usulü, ince kıyılmış sebzeler ve nar.',
      LONG.salataSpot,
      undefined,
      '130 ₺',
    ),
    spotlightItem(
      'Roka Salata',
      'Taze roka, parmesan ve limon. Sade ve ferah.',
      LONG.salataSpot,
      undefined,
      '140 ₺',
    ),
  ],
  fullList: [
    listItem('Mevsim Salata', LONG.salataList, '130 ₺'),
    listItem('Çoban Salata', LONG.salataList, '130 ₺'),
    listItem('Yeşil Salata', LONG.salataList, '120 ₺'),
    listItem('İstanbul Salata', LONG.salataList, '150 ₺'),
  ],
};

export const PORSIYON_BALIK: MenuSection = {
  id: 'porsiyon-balik',
  eyebrow: 'PORSİYON BALIK',
  title: 'Porsiyon Balık',
  listLabel: '— Tüm Porsiyon Balıklar —',
  spotlight: [
    spotlightItem(
      'Levrek Izgara',
      'Bütün levrek, mangalda. Limon-ot eşliğinde.',
      LONG.porsiyonSpot,
      undefined,
      '625 ₺',
    ),
    spotlightItem(
      'Çipura Izgara',
      'Bütün çipura, kömür ateşinde.',
      LONG.porsiyonSpot,
      undefined,
      '575 ₺',
    ),
    spotlightItem(
      'Somon Izgara',
      'İri somon dilimi, ızgarada hafif pişirilir.',
      LONG.porsiyonSpot,
      undefined,
      '750 ₺',
    ),
  ],
  fullList: [
    listItem('Dil Şiş', LONG.porsiyonList, '700 ₺'),
    listItem('Lagos Şiş', LONG.porsiyonList, '850 ₺'),
    listItem('Somon Şiş', LONG.porsiyonList, '750 ₺'),
    listItem('Barbun Tava / Izgara', LONG.porsiyonList, '450 ₺'),
    listItem('Balık Şaşlık', LONG.porsiyonList, '600 ₺'),
    listItem('Balık Kavurma', LONG.porsiyonList, '550 ₺'),
  ],
};

export const SEZON_BALIK: MenuSection = {
  id: 'sezon-balik',
  eyebrow: 'SEZON BALIK ÇEŞİTLERİ',
  title: 'Sezon Balık Çeşitleri',
  listLabel: '— Tüm Sezon Balıkları —',
  spotlight: [
    spotlightItem(
      'Levrek',
      'Sezonun klasik balığı. Pişirme tercihiniz şefe iletilir.',
      LONG.sezonSpot,
      undefined,
      '625 ₺',
    ),
    spotlightItem(
      'Çipura',
      'Tezgâhın sevileni. Izgara ya da tava.',
      LONG.sezonSpot,
      undefined,
      '575 ₺',
    ),
    spotlightItem(
      'Lagos',
      'Beyaz etli, doyurucu. Sezonun değerlilerinden.',
      LONG.sezonSpot,
      undefined,
      '900 ₺',
    ),
  ],
  fullList: [
    listItem('Lüfer', LONG.sezonList, '775 ₺'),
    listItem('Minekop', LONG.sezonList, '650 ₺'),
    listItem('Fangri', LONG.sezonList, '800 ₺'),
    listItem('Akya', LONG.sezonList, '750 ₺'),
    listItem('Mercan', LONG.sezonList, '700 ₺'),
    listItem('Dülger', LONG.sezonList, '800 ₺'),
    listItem('Barbun', LONG.sezonList, '450 ₺'),
    listItem('Kılıç', LONG.sezonList, '900 ₺'),
    listItem('Kaya Levreği', LONG.sezonList, '650 ₺'),
    listItem('Mezgit', LONG.sezonList, '400 ₺'),
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
      undefined,
      '380 ₺',
    ),
    spotlightItem(
      'Et Çökertme',
      'İnce dilimli et, yoğurt ve domates eşliğinde.',
      LONG.etSpot,
      undefined,
      '550 ₺',
    ),
    spotlightItem(
      'Tavuk Schnitzel',
      'İnce dövülmüş tavuk, çıtır kaplama. Limonla.',
      LONG.etSpot,
      undefined,
      '360 ₺',
    ),
  ],
  fullList: [
    listItem('Et Şiş', LONG.etList, '550 ₺'),
    listItem('Tavuk Pırzola', LONG.etList, '380 ₺'),
    listItem('Sucuklu Pizza', LONG.etList, '320 ₺'),
    listItem('Margarita Pizza', LONG.etList, '280 ₺'),
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
      undefined,
      '140 ₺',
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
    listItem('Ayva Tatlısı', LONG.tatliList, '150 ₺'),
    listItem('Kazandibi', LONG.tatliList, '130 ₺'),
    listItem('Sufle', LONG.tatliList, '170 ₺'),
    listItem('Balmadem', LONG.tatliList, '140 ₺'),
    listItem('Fırın Helva', LONG.tatliList, '140 ₺'),
    listItem('Dondurmalı İrmik', LONG.tatliList, '150 ₺'),
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
