/**
 * Misafirlerin kendi kendine söylediği tek satırlar — YALNIZ VERİ (three'siz, motor yok).
 *
 * Karar (2026-10-02): karşılıklı sohbet YOK. Her satır tek başına anlamlı; kimseye cevap
 * vermez, kimseye hitap etmez. Konular: yemeğin güzelliği, gün batımının keyfi, deniz ve tatil
 * havası. Türkçe satırlar doğal, gündelik konuşma dilinde (anlam kayması yok); turistler
 * İngilizce, Rusça ve Almanca konuşur (Rusçada cinsiyet çekimli geçmiş zaman yok).
 *
 * Kurallar: ≤ 44 karakter; alkol, fiyat, rezervasyon, gerçek kişi/personel adı, siyaset, din,
 * futbol yok; yemekler menüde gerçekten var (app/menu/_data.ts); sahneyle çelişmez (güneş henüz
 * batmadı, gökyüzünde bulut yok, sıcak bir yaz akşamı). Balonlara Faz 3'te bağlanır.
 */

import type { Stage } from './roster';

export type NpcLang = 'tr' | 'en' | 'ru' | 'de';
export type NpcPlace = 'table' | 'promenade' | 'beach' | 'side';
export type NpcPose = 'sit' | 'stand' | 'walk';
export type NpcLine = {
  readonly id: string;
  readonly lang: NpcLang;
  readonly text: string;
  readonly who: 'adult' | 'elder' | 'kid' | 'any';
  readonly where: readonly NpcPlace[];
  readonly topic: 'food' | 'sunset' | 'sea' | 'mood';
  /** Yalnız masa satırları için: yemeğin aşaması (`any` her aşamada). */
  readonly stage: 'meze' | 'balik' | 'tatli' | 'cay' | 'any';
  /** Yalnız bu duruştakiler söyler ("buradan kalkmam" oturan, "yürümek ne güzel" yürüyen). */
  readonly pose?: readonly NpcPose[];
  /** Açık hava satırı (rüzgâr, serinlik): iç salonda ve camlı üst katta söylenmez. */
  readonly open?: true;
};

/**
 * Masa aşaması → söylenebilecek satır aşamaları. Çay tatlıyla birlikte servis edilir; yeni
 * oturmuş masada yemek satırı yok (yalnız `any`).
 */
export const LINE_STAGES: Readonly<Record<Stage, readonly NpcLine['stage'][]>> = {
  yeni: ['any'],
  meze: ['meze', 'any'],
  balik: ['balik', 'any'],
  tatli: ['tatli', 'cay', 'any'],
};

export const NPC_LINES: readonly NpcLine[] = [
  { id: 'tr-001', lang: 'tr', text: 'Haydarinin sarımsağı tam yerinde.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-002', lang: 'tr', text: 'Atom hafif yakıyor ama çok güzel.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-003', lang: 'tr', text: 'Ekmeği humusa banmadan duramıyorum.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-004', lang: 'tr', text: 'Şakşuka tam bir yaz mezesi.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-005', lang: 'tr', text: 'Köz patlıcan tahinle çok güzel olmuş.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-006', lang: 'tr', text: 'Levrek marin çok hafif, bayıldım.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-007', lang: 'tr', text: 'Ahtapot yumuşacık olmuş, çok güzel.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-008', lang: 'tr', text: 'Kalamar tava çıtır çıtır olmuş.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-009', lang: 'tr', text: 'Karides tava tereyağıyla nefis olmuş.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-010', lang: 'tr', text: 'Balık çorbası çok lezzetli olmuş.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-011', lang: 'tr', text: 'Cacık bu sıcakta çok iyi geldi.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-012', lang: 'tr', text: 'Yaprak sarması annemin yaptığı gibi.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-013', lang: 'tr', text: 'Deniz börülcesini çok özlemişim.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-014', lang: 'tr', text: 'Ezmenin acısı tam kararında.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-015', lang: 'tr', text: 'Favayı silip süpürdüm.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-016', lang: 'tr', text: 'Patatesin hepsini ben yiyeceğim!', who: 'kid', where: ['table'], topic: 'food', stage: 'meze' },
  { id: 'tr-017', lang: 'tr', text: 'Levreğin eti bembeyaz, tam pişmiş.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-018', lang: 'tr', text: 'Kömürde çipura bambaşka oluyor.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-019', lang: 'tr', text: 'Balık ağızda dağılıyor resmen.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-020', lang: 'tr', text: 'Lagosu ilk kez yiyorum, çok lezzetliymiş.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-021', lang: 'tr', text: 'Somon tam istediğim gibi pişmiş.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-022', lang: 'tr', text: 'Barbun tavayı görünce dayanamadım.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-023', lang: 'tr', text: 'Levrek lokum gerçekten lokum gibi.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-024', lang: 'tr', text: 'Balık şaşlık çok lezzetli olmuş.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-025', lang: 'tr', text: 'Çipuranın derisi bile lezzetli.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-026', lang: 'tr', text: 'Levrek dumanı üstünde geldi, nefis.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-027', lang: 'tr', text: 'Balık mis gibi kokuyor, iştahım açıldı.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-028', lang: 'tr', text: 'Limonu sıkınca daha da güzel oldu.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-029', lang: 'tr', text: 'Uzun zamandır böyle balık yemedim.', who: 'elder', where: ['table'], topic: 'food', stage: 'balik' },
  { id: 'tr-030', lang: 'tr', text: 'Tam balık yemelik bir akşam.', who: 'any', where: ['table'], topic: 'food', stage: 'any' },
  { id: 'tr-031', lang: 'tr', text: 'Kabak tatlısı tahinle çok iyi gidiyor.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },
  { id: 'tr-032', lang: 'tr', text: 'Doydum ama tatlıya her zaman yer var.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },
  { id: 'tr-033', lang: 'tr', text: 'Ekmek kadayıfı kaymakla bir harika.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },
  { id: 'tr-034', lang: 'tr', text: 'İncir tatlısı ne güzelmiş.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },
  { id: 'tr-035', lang: 'tr', text: 'Kazandibi tam kıvamında.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },
  { id: 'tr-036', lang: 'tr', text: 'Sufle sıcacık, içi akıyor.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },
  { id: 'tr-037', lang: 'tr', text: 'Tatlımın yanında dondurma var!', who: 'kid', where: ['table'], topic: 'food', stage: 'tatli' },
  { id: 'tr-038', lang: 'tr', text: 'Çay da geldi, keyfimize diyecek yok.', who: 'any', where: ['table'], topic: 'food', stage: 'cay' },
  { id: 'tr-039', lang: 'tr', text: 'Deniz kenarında çay bir başka oluyor.', who: 'any', where: ['table'], topic: 'food', stage: 'cay' },
  { id: 'tr-040', lang: 'tr', text: 'Çayın rengi tam tavşan kanı.', who: 'any', where: ['table'], topic: 'food', stage: 'cay' },
  { id: 'tr-041', lang: 'tr', text: 'Çay tam demini almış.', who: 'any', where: ['table'], topic: 'food', stage: 'cay' },
  { id: 'tr-042', lang: 'tr', text: 'Yemeğin üstüne bir çay şart.', who: 'elder', where: ['table'], topic: 'food', stage: 'cay' },
  { id: 'tr-043', lang: 'tr', text: 'Güneş yavaş yavaş batıyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-044', lang: 'tr', text: 'Güneş denize doğru iniyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-045', lang: 'tr', text: 'Gökyüzü kıpkırmızı olmuş, ne güzel.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-046', lang: 'tr', text: 'Bu manzaraya doyum olmaz.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-047', lang: 'tr', text: 'Gün batımına tam yetiştik.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-048', lang: 'tr', text: 'Gökyüzü turuncuya boyandı.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-049', lang: 'tr', text: 'Deniz pembeye çalıyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-050', lang: 'tr', text: 'Bunun fotoğrafını çekmem lazım.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-051', lang: 'tr', text: 'Bu renkler fotoğrafta hiç çıkmıyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-052', lang: 'tr', text: 'Güneş batarken yemek ayrı bir keyif.', who: 'any', where: ['table'], topic: 'sunset', stage: 'any' },
  { id: 'tr-053', lang: 'tr', text: 'Deniz altın gibi parlıyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-054', lang: 'tr', text: 'Şu renkler inanılmaz.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-055', lang: 'tr', text: 'Güneş tam karşımızda batıyor.', who: 'any', where: ['beach'], topic: 'sunset', stage: 'any' },
  { id: 'tr-056', lang: 'tr', text: 'Sırf bu gün batımı için gelmeye değer.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-057', lang: 'tr', text: 'Oh, şimdi tek işim gün batımını izlemek.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-058', lang: 'tr', text: 'Akşamın en güzel saati şimdi.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-059', lang: 'tr', text: 'Bu saatte burası çok güzel oluyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-060', lang: 'tr', text: 'Güneş battıkça deniz renk değiştiriyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-061', lang: 'tr', text: 'Telefonu kenara koyup izlemek lazım.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-062', lang: 'tr', text: 'Güneş batmadan buradan kalkmam.', who: 'any', where: ['table', 'beach'], topic: 'sunset', stage: 'any', pose: ['sit'] },
  { id: 'tr-063', lang: 'tr', text: 'Her akşam böyle bir gün batımı olsa.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-064', lang: 'tr', text: 'Güneş kocaman ve turuncu olmuş!', who: 'kid', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-065', lang: 'tr', text: 'Güneş batıyor, her yer pembe!', who: 'kid', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-066', lang: 'tr', text: 'Gençliğimde de burada güneşi izlerdim.', who: 'elder', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-067', lang: 'tr', text: 'Yıllar geçti, bu manzara hiç değişmemiş.', who: 'elder', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },
  { id: 'tr-068', lang: 'tr', text: 'Kumsal bu saatte çok sakin.', who: 'any', where: ['beach', 'promenade'], topic: 'sea', stage: 'any' },
  { id: 'tr-069', lang: 'tr', text: 'Rüzgâr serin serin esiyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any', open: true },
  { id: 'tr-070', lang: 'tr', text: 'Dalga sesi insana huzur veriyor.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any' },
  { id: 'tr-071', lang: 'tr', text: 'Deniz bugün çarşaf gibi.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any' },
  { id: 'tr-072', lang: 'tr', text: 'Ayaklarımı suya sokasım geldi.', who: 'any', where: ['promenade', 'beach'], topic: 'sea', stage: 'any' },
  { id: 'tr-073', lang: 'tr', text: 'Su ılıkmış, akşam da girilir.', who: 'any', where: ['beach'], topic: 'sea', stage: 'any' },
  { id: 'tr-074', lang: 'tr', text: 'Bu deniz kokusu ne güzel.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any' },
  { id: 'tr-075', lang: 'tr', text: 'Oh be, akşam serinliği başladı.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any', open: true },
  { id: 'tr-076', lang: 'tr', text: 'Deniz havası ilaç gibi geldi.', who: 'elder', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any' },
  { id: 'tr-077', lang: 'tr', text: 'Yine denize girmek istiyorum!', who: 'kid', where: ['beach'], topic: 'sea', stage: 'any' },
  { id: 'tr-078', lang: 'tr', text: 'Burada saatlerce oturabilirim.', who: 'any', where: ['table', 'beach'], topic: 'mood', stage: 'any', pose: ['sit'] },
  { id: 'tr-079', lang: 'tr', text: 'İşi gücü unuttum resmen.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },
  { id: 'tr-080', lang: 'tr', text: 'Tatil dediğin böyle olur.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },
  { id: 'tr-081', lang: 'tr', text: 'Palmiyelerin altında yürümek ne güzel.', who: 'any', where: ['promenade'], topic: 'mood', stage: 'any', pose: ['walk'] },
  { id: 'tr-082', lang: 'tr', text: 'Keşke bu tatil hiç bitmese.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },
  { id: 'tr-083', lang: 'tr', text: 'Kafa dinlemek için birebir yer.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },
  { id: 'tr-084', lang: 'tr', text: 'Kumdan kale yapacağım!', who: 'kid', where: ['beach'], topic: 'mood', stage: 'any' },
  { id: 'en-001', lang: 'en', text: 'This sea bass is cooked perfectly.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },  // Bu levrek tam kıvamında pişmiş.
  { id: 'en-002', lang: 'en', text: 'Ooh, the calamari\'s nice and crispy.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },  // Oh, kalamar çıtır çıtır olmuş.
  { id: 'en-003', lang: 'en', text: 'This octopus is so tender.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },  // Bu ahtapot yumuşacık olmuş.
  { id: 'en-004', lang: 'en', text: 'These prawns are absolutely lush.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },  // Bu karidesler gerçekten nefis.
  { id: 'en-005', lang: 'en', text: 'First time trying grouper. Delicious.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },  // Lagosu ilk kez yiyorum. Çok lezzetli.
  { id: 'en-006', lang: 'en', text: 'Grilled fish by the sea. Can\'t beat it.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },  // Deniz kenarında ızgara balık. Üstüne yok.
  { id: 'en-007', lang: 'en', text: 'Lovely bit of fish, this.', who: 'elder', where: ['table'], topic: 'food', stage: 'balik' },  // Bu balık çok güzel olmuş.
  { id: 'en-008', lang: 'en', text: 'Fish and chips! My favourite!', who: 'kid', where: ['table'], topic: 'food', stage: 'balik' },  // Balık ve patates kızartması! En sevdiğim!
  { id: 'en-009', lang: 'en', text: 'The fig dessert is gorgeous.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },  // İncir tatlısı çok güzel.
  { id: 'en-010', lang: 'en', text: 'Turkish tea after dinner. Just right.', who: 'any', where: ['table'], topic: 'food', stage: 'cay' },  // Yemekten sonra Türk çayı. Tam yerinde.
  { id: 'en-011', lang: 'en', text: 'What a sunset. Absolutely stunning.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Ne gün batımı ama! Muhteşem.
  { id: 'en-012', lang: 'en', text: 'The sky\'s gone all pink and orange.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Gökyüzü pembeli turunculu olmuş.
  { id: 'en-013', lang: 'en', text: 'The sun\'s sinking towards the sea.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Güneş denize doğru iniyor.
  { id: 'en-014', lang: 'en', text: 'Got here just in time for sunset.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Gün batımına tam zamanında yetiştik.
  { id: 'en-015', lang: 'en', text: 'Dinner as the sun goes down. Lovely.', who: 'any', where: ['table'], topic: 'sunset', stage: 'any' },  // Güneş batarken akşam yemeği. Çok güzel.
  { id: 'en-016', lang: 'en', text: 'The whole sea\'s turned gold.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Bütün deniz altın rengine döndü.
  { id: 'en-017', lang: 'en', text: 'The sun\'s going into the sea!', who: 'kid', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Güneş denize giriyor!
  { id: 'en-018', lang: 'en', text: 'Haven\'t seen a sky like this in years.', who: 'elder', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Yıllardır böyle bir gökyüzü görmemiştim.
  { id: 'en-019', lang: 'en', text: 'This breeze is heaven.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any', open: true },  // Bu esinti bir harika.
  { id: 'en-020', lang: 'en', text: 'I want to go swimming!', who: 'kid', where: ['promenade', 'beach'], topic: 'sea', stage: 'any' },  // Denize girmek istiyorum!
  { id: 'en-021', lang: 'en', text: 'Properly in holiday mode now.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },  // Artık tam tatil moduna girdim.
  { id: 'en-022', lang: 'en', text: 'No emails, just the sea. Bliss.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },  // E-posta yok, sadece deniz. Oh be!
  { id: 'ru-001', lang: 'ru', text: 'Сибас просто тает во рту.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },  // Levrek resmen ağızda eriyor.
  { id: 'ru-002', lang: 'ru', text: 'Эти закуски — пальчики оближешь.', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },  // Bu mezeler parmak yedirtir.
  { id: 'ru-003', lang: 'ru', text: 'Рыбка — чудо как хороша.', who: 'elder', where: ['table'], topic: 'food', stage: 'balik' },  // Balık ne kadar da güzel olmuş.
  { id: 'ru-004', lang: 'ru', text: 'Картошка фри — вкуснятина!', who: 'kid', where: ['table'], topic: 'food', stage: 'meze' },  // Patates kızartması çok lezzetli!
  { id: 'ru-005', lang: 'ru', text: 'Тыквенный десерт — просто объедение!', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },  // Kabak tatlısı tek kelimeyle nefis!
  { id: 'ru-006', lang: 'ru', text: 'Турецкий чай после ужина — то, что надо.', who: 'any', where: ['table'], topic: 'food', stage: 'cay' },  // Yemekten sonra Türk çayı, tam yerinde.
  { id: 'ru-007', lang: 'ru', text: 'Какой закат, просто сказка!', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Ne gün batımı, masal gibi!
  { id: 'ru-008', lang: 'ru', text: 'Солнце садится прямо в море.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Güneş tam denize batıyor.
  { id: 'ru-009', lang: 'ru', text: 'Ради такого заката стоило лететь.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Böyle bir gün batımı için uçakla gelmeye değdi.
  { id: 'ru-010', lang: 'ru', text: 'Солнышко такое большое и красное!', who: 'kid', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Güneş kocaman ve kıpkırmızı!
  { id: 'ru-011', lang: 'ru', text: 'Красота-то какая!', who: 'elder', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Ne güzellik ama!
  { id: 'ru-012', lang: 'ru', text: 'Какой приятный морской ветерок.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sea', stage: 'any', open: true },  // Ne hoş bir deniz esintisi.
  { id: 'ru-013', lang: 'ru', text: 'Вода тёплая, как парное молоко.', who: 'any', where: ['beach'], topic: 'sea', stage: 'any' },  // Su, yeni sağılmış süt gibi ılık.
  { id: 'ru-014', lang: 'ru', text: 'Хочу купаться!', who: 'kid', where: ['promenade', 'beach'], topic: 'sea', stage: 'any' },  // Denize girmek istiyorum!
  { id: 'ru-015', lang: 'ru', text: 'Вот это отпуск!', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },  // İşte tatil buna denir!
  { id: 'ru-016', lang: 'ru', text: 'Никуда не хочется уходить.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },  // İnsanın hiçbir yere gidesi gelmiyor.
  { id: 'de-001', lang: 'de', text: 'Der Wolfsbarsch ist ein Traum.', who: 'any', where: ['table'], topic: 'food', stage: 'balik' },  // Levrek bir harika.
  { id: 'de-002', lang: 'de', text: 'Calamari vom Grill, köstlich!', who: 'any', where: ['table'], topic: 'food', stage: 'meze' },  // Izgara kalamar, nefis!
  { id: 'de-003', lang: 'de', text: 'Das Kürbisdessert ist himmlisch.', who: 'any', where: ['table'], topic: 'food', stage: 'tatli' },  // Kabak tatlısı nefis.
  { id: 'de-004', lang: 'de', text: 'Die Pommes sind voll lecker!', who: 'kid', where: ['table'], topic: 'food', stage: 'meze' },  // Patatesler çok lezzetli!
  { id: 'de-005', lang: 'de', text: 'Was für ein Sonnenuntergang!', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Ne gün batımı ama!
  { id: 'de-006', lang: 'de', text: 'Die Sonne versinkt im Meer.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Güneş denize batıyor.
  { id: 'de-007', lang: 'de', text: 'Ach, diese Abendsonne ist herrlich.', who: 'elder', where: ['table', 'promenade', 'beach', 'side'], topic: 'sunset', stage: 'any' },  // Ah, bu akşam güneşi ne güzel.
  { id: 'de-008', lang: 'de', text: 'Endlich Urlaub, endlich Meer.', who: 'any', where: ['table', 'promenade', 'beach', 'side'], topic: 'mood', stage: 'any' },  // Nihayet tatil, nihayet deniz.
];
