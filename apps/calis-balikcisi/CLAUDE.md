# CLAUDE.md — Çalış Balıkçısı (apps/calis-balikcisi)

Kök `CLAUDE.md`'yi tamamlayıcıdır; burada yalnız bu uygulamaya özgü kurallar var.

## Marka Kimliği

- **Konumlandırma:** Sahil, akşam yemeği, deneyim, premium.
- **Ton:** Sıcak ama premium. Kısa cümle, duyusal dil. Sıfat yığmaktan kaçın.
- **Hedef kitle:** Çiftler, turistler, akşam keyfi arayanlar.
- **Ana CTA:** "Masa ayırt" (her zaman birincil aksiyon).
- **İkincil CTA:** "WhatsApp'tan yaz", "Bizi ara".

## Tasarım Token'ları

```css
--color-bg: #0B1E2A;       /* koyu deniz */
--color-fg: #F5EFE6;       /* kum */
--color-accent: #D4A259;   /* altın / gün batımı */
--color-muted: #3A4F5C;
--font-display: 'Cormorant Garamond', serif;
--font-body: 'Inter', sans-serif;
```

Koyu arka plan varsayılan. Aksanlar ışık oyunu gibi kullanılır. Beyaz arka plan kullanma.

## Bilgi Mimarisi

```
/                       Ana sayfa
/rezervasyon            5 adımlı form
/rezervasyon-onay/:code Onay ekranı
/menu                   Kategori filtreli dinamik menü
/menu/gunun-baliklari
/menu/mezeler
/konsept                Hikaye
/galeri                 Atmosfer odaklı
/iletisim
/kvkk
/cerez-politikasi
```

## Ana Sayfa Section Sırası (Değiştirme)

1. Hero — konsept + "Masa ayırt" CTA
2. Günün mezadı — bugün ağdan çıkanlar
3. Hızlı rezervasyon widget (tarih, saat, kişi)
4. Gün batımı masası önerisi
5. Menü özeti (3 kategori kartı)
6. Konsept / hikaye
7. Sosyal kanıt (Google puan + yorum)
8. İletişim + harita
9. (Mobil) sticky bottom bar

## Rezervasyon Sistemi

### Akış (5 adım)

1. Tarih + kişi sayısı
2. Saat seçimi (yoğunluk ışığı: yeşil/sarı/kırmızı)
3. Masa türü
4. İletişim + not
5. Onay ekranı + WhatsApp alternatifi

### Masa Türleri

| Kod | İsim | Kapasite | Not |
|---|---|---|---|
| `sea-view` | Sahil manzaralı | 2-4 | Premium, gün batımında sınırlı |
| `standard` | Standart | 2-6 | Varsayılan |
| `quiet` | Sakin köşe | 2-4 | Gürültüden uzak |
| `couple` | Çift kişilik | 2 | Romantik, akşam |
| `group` | Büyük grup | 6-12 | **Manuel onay zorunlu** |

### Müsaitlik Mantığı

- Saat dilimleri 30 dakikalık blok (19:00, 19:30, 20:00...).
- Her masa türünün her saat için `capacity` değeri var.
- Bir rezervasyon masayı **2 saat 30 dakika** tutar (konfigürasyondan).
- `group` türü veya **8+ kişi** otomatik onaylanmaz — `status: pending`.
- 2 saat içinde admin onaylamazsa yöneticiye hatırlatma (cron).

### API Endpoint'leri

| Method | Yol | İş |
|---|---|---|
| GET | `/api/availability?date=YYYY-MM-DD&party=N` | Saat + yoğunluk listesi |
| POST | `/api/reservation` | Oluştur (pending veya confirmed) |
| GET | `/api/reservation/:code` | Onay ekranı verisi |
| POST | `/api/reservation/:code/cancel` | Token ile iptal |
| GET | `/api/sunset?date=YYYY-MM-DD` | Gün batımı saati (v1: statik tablo) |
| GET | `/api/daily-fish` | Günün balıkları (CMS cache, 15 dk) |

### Veri Modeli

```sql
tables (id, type, capacity_min, capacity_max, active)
time_slot_capacity (id, date, time, table_type, capacity)
reservations (
  id, code, date, time, duration_min,
  table_type, party_size,
  guest_name, guest_phone, guest_email, note,
  status ENUM('pending','confirmed','cancelled','no-show'),
  source ENUM('web','whatsapp','phone'),
  created_at, updated_at
)
```

### Doğrulama (Zod şeması)

```ts
const reservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  party_size: z.number().int().min(1).max(20),
  table_type: z.enum(['sea-view','standard','quiet','couple','group']),
  guest_name: z.string().min(2).max(80),
  guest_phone: z.string().regex(/^\+?\d{10,15}$/),
  guest_email: z.string().email().optional(),
  note: z.string().max(500).optional(),
  kvkk_consent: z.literal(true),
});
```

### WhatsApp Pre-Filled Link

```ts
const buildWaLink = (phone: string, msg: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
```

Formda girilen tarih/saat/kişi bilgisi mesaja pre-fill edilir. Kullanıcı istediği adımda WhatsApp'a geçebilmeli — her ekranda sabit alternatif CTA var.

## CMS Koleksiyonları (`cb_` prefix)

- `cb_daily_fish` — {date, fish[], note}
- `cb_daily_specials` — {date, items[], note}
- `cb_featured_tables` — {date, tableTypes[]}
- `cb_menu_items` — {category, name, desc, price, season_tag, photo}
- `cb_gallery` — {image, tag, order}
- `cb_settings` — {phone, whatsapp, address, workingHours, sunsetOverride}

## Microcopy Kuralları

- Başlıklarda sıfat yığma. "En taze, en lezzetli, en güzel" gibi ifadeler yasak.
- "Ağdan tabağa", "tuzlu rüzgar", "gün batımı" gibi duyusal ifadeler tercih edilir.
- Hata mesajı: neden + ne yapılacak. "Bu saat doldu. Önerilen: 18:30 veya 20:30."
- Emoji ana sayfada **kullanılmaz**. Rezervasyon akışında 🌅 ve yoğunluk rozetinde (🟢🟡🔴) sınırlı kullanım serbest.

## Yapma

- Ana sayfada otomatik açılan popup, newsletter modal, cookie wall.
- Hero'da carousel / slider.
- Menüde fiyatları "XX TL'den başlayan" şeklinde yazma — net fiyat.
- PDF menü linki.
- Fotoğrafları filtresiz/işlenmemiş koyma.
- "Şef özel kokteyli" gibi alkollü içecek vurgusu — bu site alkollü olmayı saklamaz ama mesaj deneyim/yemek odaklı, içki odaklı değil.
