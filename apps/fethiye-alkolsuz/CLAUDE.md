# CLAUDE.md — Fethiye Alkolsüz Balık (apps/fethiye-alkolsuz)

Kök `CLAUDE.md`'yi tamamlayıcıdır; burada yalnız bu uygulamaya özgü kurallar var.

## Marka Kimliği

- **Konumlandırma:** Aile, huzur, alkolsüz, güven.
- **Ton:** Açık, samimi, güven verici. Üstü kapalı değil — alkolsüz oluşu ilk ekranda, net.
- **Hedef kitle:** Çocuklu aileler, muhafazakâr misafirler, büyük aile buluşmaları.
- **Ana CTA:** "Bizi arayın" (`tel:` linki).
- **İkincil CTA:** "WhatsApp'tan yazın", "Yol tarifi al".

## Tasarım Token'ları

```css
--color-bg: #FBFAF6;       /* aydınlık, krem */
--color-fg: #1F2937;       /* koyu lacivert-gri */
--color-accent: #0F766E;   /* sakin yeşil */
--color-muted: #6B7280;
--font-display: 'DM Serif Display', serif;
--font-body: 'Inter', sans-serif;
```

Açık arka plan varsayılan. Koyu mod **yok**. Renkler sakin, yüksek kontrast.

## Bilgi Mimarisi

```
/               Ana sayfa
/menu           Sade, tek sayfa menü (kategorili)
/neden-biz      Konsept + güven unsurları
/aile-grup      Büyük aile / grup iletişim sayfası
/galeri         Aile dostu atmosfer
/iletisim       Adres, telefon, WhatsApp, yol tarifi
/kvkk
/cerez-politikasi
```

**Rezervasyon sayfası yok.** `reservation-engine` paketi bu uygulamaya import edilmez.

## Ana Sayfa Section Sırası (Değiştirme)

1. Hero — "Ailece, gönül rahatlığıyla balık." + **"Restoranımızda alkol servisi yapılmamaktadır."** rozeti + "Bizi arayın" CTA
2. Neden biz — 6 kart (aile dostu, alkolsüz, sessiz, hijyen, çocuklu uygun, geniş masa)
3. Menü özeti — 4 kategori (Izgara, Fırın, Mezeler, Çocuk menüsü)
4. Büyük aile / grup iletişim yönlendirme
5. Ortam galerisi (aile masaları, aydınlık mekân)
6. Lokasyon + yol tarifi CTA
7. İletişim
8. (Mobil) sticky bottom bar: 📞 Ara · 💬 WhatsApp · 📍 Yol tarifi

## Büyük Aile İletişim Formu

Basit form, rezervasyon motoru yok. 4 alan:

```ts
const groupInquirySchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^\+?\d{10,15}$/),
  party_size: z.number().int().min(6).max(60),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().max(500).optional(),
  kvkk_consent: z.literal(true),
});
```

Form gönderildiğinde:
1. Email ile yöneticiye gider (Resend).
2. WhatsApp deep link üzerinden kullanıcıya pre-filled mesaj alternatifi sunulur.
3. Onay ekranı: "Size 2 saat içinde WhatsApp'tan döneceğiz."

## CMS Koleksiyonları (`fa_` prefix)

- `fa_menu_items` — {category (`kids`/`main`/`meze`/`dessert`/`grill`/`oven`), name, desc, price, photo}
- `fa_why_us` — {icon, title, text, order}
- `fa_gallery` — {image, tag, order}
- `fa_settings` — {phone, whatsapp, address, workingHours, mapsUrl}

## Microcopy Kuralları

- Alkolsüz olma durumu **ilk ekranda, net**, üstü kapalı değil. "Alkol servisi yapılmamaktadır." ifadesi hero'da sabit.
- Güven dilini kullan: "gönül rahatlığıyla", "huzurla", "ailece".
- Aşırı resmi olma ama samimi de aşırıya kaçma. Orta ton.
- Çocuklu aile ifadesi net ama stereotipik değil — "çocuk sandalyesi var", "çocuk menüsü mevcut" gibi somut bilgi.
- Hata mesajı: kibar + somut. "Telefon numarası 10 haneli olmalı."

## "Neden Biz" Kartları (Standart Set)

MVP'de CMS'ten geliyor ama varsayılan set şu olmalı:

1. **Aile dostu ortam** — "Çocuklarınızla rahat edebileceğiniz masalar."
2. **Alkol servisi yok** — "Tüm misafirlerimiz için güvenli, huzurlu bir ortam."
3. **Sessiz oturma alanı** — "Sohbetinizi bölmeyen bir atmosfer."
4. **Hijyen standardı** — "Mutfağımız her gün denetlenir."
5. **Çocuk menüsü** — "Çocuklar için özel hazırlanmış seçenekler."
6. **Büyük aile masaları** — "Kalabalık aile buluşmaları için yer ayırabiliriz."

## Yapma

- "Bar", "kokteyl", "şarap", "bira", "içki", "alkol eşliği" gibi ifadeler menüde veya herhangi bir yerde **asla** geçmez. Menüde içecek kategorisi yalnız meşrubat, ayran, doğal su, çay, kahve.
- Ana sayfada carousel/slider.
- Otomatik popup, newsletter modal.
- Rezervasyon butonu / rezervasyon kelimesi — bu sitede rezervasyon **yok**. "İletişim", "Bize yazın", "Arayın" dili kullan.
- Koyu tema.
- PDF menü.
- Emoji ana metinde. Sadece iletişim bottom bar'ında ikon olarak (📞 💬 📍).
- "Muhafazakâr" kelimesini doğrudan site metninde kullanma. Mesaj aileye ve huzura odaklı, etiket dili değil.
- Çocuk görselinde yüz tanınır şekilde olmayan fotoğraflar kullan (KVKK + gizlilik).

## SEO Odağı

- Yerel arama kritik: "Fethiye alkolsüz restoran", "Fethiye aile restoranı", "Fethiye çocuklu restoran".
- Google Business Profile güncel olmalı.
- `schema.org/Restaurant` markup'ında `servesCuisine: "Seafood"` ve açıklama alanında alkolsüz konsept belirtilir.
- `servesAlcohol: false` property'si schema'da açıkça belirtilmeli.
