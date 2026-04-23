# Çalış Balıkçısı & Fethiye Alkolsüz Balık — Web Sitesi Planlama Dokümanı

**Hedef:** Aynı sahibe ait iki farklı konumlandırmaya sahip restoran markasının, kullanıcıyı karıştırmadan, dönüşüm odaklı ve Claude Code ile doğrudan geliştirilebilecek web sitelerini planlamak.

---

## 1. Genel Strateji Özeti

İki marka aynı "sahip ailesine" ait olduğu hissedilsin ama hedef kitle, ton ve dönüşüm yolları tamamen ayrışsın. Ortak altyapı (tech stack, tasarım sistemi token'ları, CMS yapısı, footer, hukuki sayfalar) paylaşılır; üst katmanda (renk, tipografi aksiyonu, mesaj hiyerarşisi, ana CTA) iki marka ayrılır.

| Boyut          | Çalış Balıkçısı                           | Fethiye Alkolsüz Balık                              |
| -------------- | ----------------------------------------- | --------------------------------------------------- |
| Konumlandırma  | Sahil, akşam yemeği, deneyim              | Aile, huzur, alkolsüz güven                         |
| Hedef kitle    | Çiftler, turistler, akşam keyfi arayanlar | Aileler, çocuklu misafirler, muhafazakâr misafirler |
| Ana aksiyon    | Online rezervasyon                        | Telefon/WhatsApp ile iletişim, yol tarifi           |
| Duygusal ton   | Premium, deneyim, gün batımı              | Rahatlık, güven, sadelik                            |
| Ana KPI        | Rezervasyon sayısı                        | Arama + WhatsApp tıklaması + yol tarifi             |
| Görsel dil     | Koyu arka plan, ışık oyunu, deniz         | Aydınlık, sıcak, sade, temiz                        |
| Teknik öncelik | Rezervasyon motoru + müsaitlik            | İletişim kanalları + SEO (yerel arama)              |

**Ortak prensipler**

- Mobil öncelikli. Tek ekranda karar: "aç → anla → ara/rezerve et."
- Menü statik PDF olmayacak; JSON/CMS üzerinden sunulacak. Günlük değişen içerikler (günün balığı, mezası) admin panelden 30 saniyede güncellenebilecek.
- İki site de aynı monorepo'da, aynı tasarım sistemini (farklı token setleriyle) kullansın.
- SEO: Yerel arama (Fethiye, Çalış) kritik. Her iki site için Google Business Profile, schema.org `Restaurant` markup'ı, menu schema.
- Hukuki ve operasyonel metinler (KVKK, çerez, iletişim) tek kaynaktan yönetilsin.

---

## 2. Marka Bazlı Strateji

### 2.1 Çalış Balıkçısı

**Ana vaat:** "Çalış sahilinde, günün taze balığı ve gün batımı manzarasıyla bir akşam."

**Ton:** Sıcak ama premium. Kısa cümle, duyusal dil ("tuzlu rüzgar", "ağdan tabağa", "gün batımı masası"). Kalabalık sıfat kullanma.

**Birincil CTA:** "Masa ayırt"
**İkincil CTA:** "WhatsApp'tan yaz" / "Bizi ara"

**Farklılaştırıcılar (sitede ön plana çıkacak):**

- Günün mezadı — "bugün ağdan çıkanlar" canlı listesi
- Gün batımı masası — saat bazlı özel rezervasyon önerisi
- Akşam yoğunluk göstergesi — kullanıcıyı erken saatlere yönlendiren dürtü
- Sahile sıfır hero — fotoğraf değil, atmosfer

**Dönüşüm akışı:**

1. Hero: Konsept + "Masa ayırt" CTA (sabit, mobilde bottom bar)
2. Günün mezadı (sosyal kanıt + aciliyet)
3. Rezervasyon modülü (3-5 adım, friction düşük)
4. Onay ekranı + WhatsApp konfirmasyonu

---

### 2.2 Fethiye Alkolsüz Balık Restaurant

**Ana vaat:** "Fethiye'de ailece gönül rahatlığıyla balık yiyebileceğiniz, alkol servisi yapılmayan huzurlu bir mekân."

**Ton:** Açık, samimi, güven verici. Üstü kapalı değil — alkolsüz oluşu ilk ekranda ve net. Çocuklu aileler için uygunluk ilk 2 ekranda.

**Birincil CTA:** "Bizi arayın" (tel:)
**İkincil CTA:** "WhatsApp'tan yazın", "Yol tarifi al"

**Farklılaştırıcılar:**

- Hero'da tek cümlelik güvence: "Restoranımızda alkol servisi yapılmamaktadır."
- "Neden biz" bölümü — aile, sessizlik, hijyen, çocuklu uygunluk ikonlarla
- Sessiz oturma alanı, çocuk alanı varsa özel görseller
- Büyük aile / kalabalık grup için "iletişime geçin" CTA'sı

**Dönüşüm akışı:**

1. Hero: Net konsept + "Bizi arayın" CTA
2. "Neden biz" — 4-6 kart, hızlı tarama
3. Menü (sade, kolay okunur)
4. Lokasyon + yol tarifi + iletişim

---

## 3. Sitemap

### 3.1 Çalış Balıkçısı
