export type MenuItem = {
  name: string;
  description?: string;
  photoUrl?: string;
  longDescription?: string;
};

export type MenuSection = {
  id: string;
  eyebrow: string;
  listLabel: string;
  spotlight: MenuItem[];
  fullList: MenuItem[];
};

const SPOTLIGHT_LONG =
  'Taze tezgâhtan, geleneksel yöntemlerle hazırlanmış. Her lokma, denizin o günkü hikayesini anlatır. Basit malzemeler, özenli ellerde bütünleşir.';

const LIST_LONG = 'Klasik tarifle, günün en iyisinden.';

function spotlightItem(name: string, description: string): MenuItem {
  return { name, description, longDescription: SPOTLIGHT_LONG };
}

function listItem(name: string): MenuItem {
  return { name, longDescription: LIST_LONG };
}

export const MEZELER: MenuSection = {
  id: 'mezeler',
  eyebrow: 'Mezes & Starters',
  listLabel: '— The Complete Selection —',
  spotlight: [
    spotlightItem(
      'Ahtapot Izgara',
      'Charred over open flame, served with creamy fava purée, caper leaves, and cold-pressed Aegean olive oil.',
    ),
    spotlightItem(
      'Deniz Börülcesi',
      'Tender samphire from the rocks of the Aegean, dressed with lemon and olive oil.',
    ),
    spotlightItem(
      'Levrek Marine',
      'Thinly sliced and cured in citrus juices, finished with fresh dill, pink peppercorn, and a touch of sea salt.',
    ),
    spotlightItem(
      'Közlenmiş Biber',
      'Smoked local peppers, slowly roasted and paired with whipped aged feta and wild oregano.',
    ),
  ],
  fullList: [
    listItem('Humus'),
    listItem('Babaganuş'),
    listItem('Cacık'),
    listItem('Haydari'),
    listItem('Kalamari Tava'),
    listItem('Karides Tuzlama'),
    listItem('Ahtapot Salatası'),
    listItem('Midye Dolma'),
    listItem('Sigara Böreği'),
    listItem('Soğan Piyazı'),
    listItem('Patlıcan Salatası'),
    listItem('Antep Ezmesi'),
    listItem('Muhammara'),
    listItem('Şakşuka'),
    listItem('Semizotu'),
    listItem('Tarama'),
    listItem('Lakerda'),
    listItem('Çiroz Salatası'),
    listItem('Fesleğenli Domates'),
    listItem('Cevizli Biber'),
    listItem('Çerkez Tavuğu'),
    listItem('Topik'),
  ],
};

export const IZGARA: MenuSection = {
  id: 'izgara',
  eyebrow: 'From the Charcoal',
  listLabel: '— Diğer Izgaralar —',
  spotlight: [
    spotlightItem(
      'Günün Balığı',
      'Çipura ya da levrek, sabah teknelerinden. Odun ateşinde, limon-ot emülsiyonuyla.',
    ),
    spotlightItem(
      'Signature İstakoz',
      'Közleri üzerinde yavaş pişirilmiş, sarımsak tereyağı ve safranlı deniz börülcesi eşliğinde.',
    ),
  ],
  fullList: [
    listItem('Çipura'),
    listItem('Levrek'),
    listItem('Palamut'),
    listItem('Lüfer'),
    listItem('Mercan'),
    listItem('Barbun'),
    listItem('İskorpit'),
    listItem('Lagos'),
    listItem('Kalkan'),
    listItem('Fangri'),
    listItem('Trança'),
    listItem('Sarıgöz'),
  ],
};

export const TATLI: MenuSection = {
  id: 'tatli',
  eyebrow: 'Sweet Endings',
  listLabel: '— Diğer Tatlılar —',
  spotlight: [
    spotlightItem(
      'Tahini Sufle',
      'Warm, molten center of rich sesame paste, baked to order and served with a dusting of roasted pistachios.',
    ),
    spotlightItem(
      'Sakız Dondurması',
      'Traditional stretched ice cream flavored with wild mastic resin, offering a subtle pine note and unique texture.',
    ),
    spotlightItem(
      'Klasik Sütlaç',
      'Klasik Türk sütlacı, taş fırında altın rengine kadar pişirilmiş.',
    ),
  ],
  fullList: [
    listItem('Baklava'),
    listItem('Kazandibi'),
    listItem('Revani'),
    listItem('Aşure'),
  ],
};

export const MENU_DATA: MenuSection[] = [MEZELER, IZGARA, TATLI];
