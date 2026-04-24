export type MenuItem = {
  name: string;
  description?: string;
};

export type MenuSection = {
  id: string;
  eyebrow: string;
  listLabel: string;
  spotlight: MenuItem[];
  fullList: MenuItem[];
};

export const MEZELER: MenuSection = {
  id: 'mezeler',
    eyebrow: 'Mezes & Starters',
    listLabel: '— The Complete Selection —',
    spotlight: [
      {
        name: 'Ahtapot Izgara',
        description:
          'Charred over open flame, served with creamy fava purée, caper leaves, and cold-pressed Aegean olive oil.',
      },
      {
        name: 'Deniz Börülcesi',
        description:
          'Tender samphire from the rocks of the Aegean, dressed with lemon and olive oil.',
      },
      {
        name: 'Levrek Marine',
        description:
          'Thinly sliced and cured in citrus juices, finished with fresh dill, pink peppercorn, and a touch of sea salt.',
      },
      {
        name: 'Közlenmiş Biber',
        description:
          'Smoked local peppers, slowly roasted and paired with whipped aged feta and wild oregano.',
      },
    ],
    fullList: [
      { name: 'Humus' },
      { name: 'Babaganuş' },
      { name: 'Cacık' },
      { name: 'Haydari' },
      { name: 'Kalamari Tava' },
      { name: 'Karides Tuzlama' },
      { name: 'Ahtapot Salatası' },
      { name: 'Midye Dolma' },
      { name: 'Sigara Böreği' },
      { name: 'Soğan Piyazı' },
      { name: 'Patlıcan Salatası' },
      { name: 'Antep Ezmesi' },
      { name: 'Muhammara' },
      { name: 'Şakşuka' },
      { name: 'Semizotu' },
      { name: 'Tarama' },
      { name: 'Lakerda' },
      { name: 'Çiroz Salatası' },
      { name: 'Fesleğenli Domates' },
      { name: 'Cevizli Biber' },
      { name: 'Çerkez Tavuğu' },
      { name: 'Topik' },
    ],
};

export const IZGARA: MenuSection = {
  id: 'izgara',
    eyebrow: 'From the Charcoal',
    listLabel: '— Diğer Izgaralar —',
    spotlight: [
      {
        name: 'Günün Balığı',
        description:
          'Çipura ya da levrek, sabah teknelerinden. Odun ateşinde, limon-ot emülsiyonuyla.',
      },
      {
        name: 'Signature İstakoz',
        description:
          'Közleri üzerinde yavaş pişirilmiş, sarımsak tereyağı ve safranlı deniz börülcesi eşliğinde.',
      },
    ],
    fullList: [
      { name: 'Çipura' },
      { name: 'Levrek' },
      { name: 'Palamut' },
      { name: 'Lüfer' },
      { name: 'Mercan' },
      { name: 'Barbun' },
      { name: 'İskorpit' },
      { name: 'Lagos' },
      { name: 'Kalkan' },
      { name: 'Fangri' },
      { name: 'Trança' },
      { name: 'Sarıgöz' },
    ],
};

export const TATLI: MenuSection = {
  id: 'tatli',
    eyebrow: 'Sweet Endings',
    listLabel: '— Diğer Tatlılar —',
    spotlight: [
      {
        name: 'Tahini Sufle',
        description:
          'Warm, molten center of rich sesame paste, baked to order and served with a dusting of roasted pistachios.',
      },
      {
        name: 'Sakız Dondurması',
        description:
          'Traditional stretched ice cream flavored with wild mastic resin, offering a subtle pine note and unique texture.',
      },
      {
        name: 'Klasik Sütlaç',
        description:
          'Klasik Türk sütlacı, taş fırında altın rengine kadar pişirilmiş.',
      },
    ],
    fullList: [
      { name: 'Baklava' },
      { name: 'Kazandibi' },
      { name: 'Revani' },
      { name: 'Aşure' },
    ],
};

export const MENU_DATA: MenuSection[] = [MEZELER, IZGARA, TATLI];
