# Çalışma Kuralları

- Bu projede sadece verilen dosya ve component üzerinde çalış.
- Tüm projeyi analiz etme.
- Gereksiz dosya okuma.

---

# Çalışma Kuralları

- Bu projede sadece verilen dosya ve component üzerinde çalış.
- Tüm projeyi analiz etme.
- Gereksiz dosya okuma.

---

# CLAUDE.md — Monorepo Kök

Bu dosya Claude Code için proje genelinde geçerli talimatları içerir. Alt dizinlerdeki `CLAUDE.md` dosyaları bu dosyayı ezer, ama ezmeyen konular burada bağlayıcıdır.

## Proje Özeti

Aynı sahibe ait iki ayrı restoran markasının web siteleri tek monorepo'da geliştirilir.

- `apps/calis-balikcisi` — Çalış Balıkçısı. **Rezervasyon sistemli**, sahil/akşam/deneyim odaklı, premium ton.
- `apps/fethiye-alkolsuz` — Fethiye Alkolsüz Balık Restaurant. **Rezervasyon yok**, aile/huzur/alkolsüz güven odaklı, sade ton.

İki site aynı marka ailesinden hissedilmeli ama hedef kitle, ton, CTA ve bilgi mimarisi farklı olmalı. Tasarımda benzerlik kurma; ortak olan altyapıdır, üst katman değildir.

## Teknoloji Yığını

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Stil:** Tailwind CSS + CSS variables (marka başına token seti)
- **CMS:** Sanity (veya Payload — seçim yapılana kadar `cms-client` paketi abstraksiyon olarak kalmalı)
- **DB:** PostgreSQL (Supabase) — yalnız Çalış tarafında kullanılır
- **Deployment:** Vercel + Supabase
- **Email:** Resend
- **Form koruma:** Cloudflare Turnstile
- **Analytics:** Plausible (KVKK uyumlu)
- **Paket yöneticisi:** pnpm workspaces + Turborepo

## Monorepo Yapısı

```
/
├── apps/
│   ├── calis-balikcisi/      # Next.js, rezervasyonlu
│   └── fethiye-alkolsuz/     # Next.js, bilgi sitesi
├── packages/
│   ├── ui/                   # Paylaşılan React component'leri
│   ├── design-tokens/        # Marka bazlı CSS variables
│   ├── cms-client/           # CMS query fonksiyonları + tipler
│   ├── reservation-engine/   # Sadece Çalış — saf TS, UI'dan bağımsız
│   └── utils/                # Tarih, format, analitik helpers
├── cms/                      # Sanity studio
├── docs/                     # Strateji, planlama dokümanları
└── CLAUDE.md
```

## Geliştirme Komutları

```bash
pnpm install                         # Tüm bağımlılıklar
pnpm dev                             # Her iki app paralel
pnpm dev --filter calis-balikcisi    # Sadece Çalış
pnpm dev --filter fethiye-alkolsuz   # Sadece Fethiye Alkolsüz
pnpm build                           # Production build, her ikisi
pnpm lint                            # Monorepo geneli
pnpm typecheck                       # tsc --noEmit her pakette
pnpm test                            # Jest + Playwright
```

## Kodlama Kuralları

### Genel
- **TypeScript strict mode** — hiçbir dosyada `any` kullanma. Zorunluysa `unknown` + type guard.
- **Named export tercih et** — default export sadece Next.js page/layout dosyalarında.
- **Server Component varsayılan** — yalnız gerektiğinde `"use client"` ekle (form, state, event handler).
- **Dosya isimleri:** `kebab-case.tsx`. Component adı `PascalCase`.
- **Utility fonksiyonlar:** saf olsun, yan etki yaratıyorsa dosya adına `-service` veya `-action` ekle.

### Bileşen Yazımı
- Her component kendi klasöründe: `component-name/index.tsx` + `component-name.tsx` + opsiyonel `component-name.test.tsx`.
- Props tipi component'le aynı dosyada, `type` ile (interface değil).
- Uzun JSX'i parçala — 120 satırı geçen component'i alt parçalara böl.

### Marka Token'ları
- Renkleri **asla** Tailwind'in varsayılan paletinden kullanma (ör. `text-blue-500` yasak). Her zaman CSS variable:
  - `var(--color-bg)`, `var(--color-fg)`, `var(--color-accent)`, `var(--color-muted)`
- Yeni token ihtiyacı `packages/design-tokens`'da merkezi olarak tanımlanmalı.

### Erişilebilirlik
- Her interaktif eleman klavye ile erişilebilir olmalı.
- Form elemanları `<label>` ile eşleşmeli; `aria-describedby` ile hata bağlantısı.
- Renk kontrastı WCAG AA (en az 4.5:1).

## KVKK ve Gizlilik

- Hiçbir müşteri verisi log'lara yazılmaz (telefon, email, isim).
- Analitik **Plausible** — çerez kullanmaz, IP hash'lenir. Google Analytics kurma.
- Rezervasyon verileri **yalnız ilgili restoran admin'i** görebilir. Monorepo'da iki app arasında veri paylaşımı yok.
- Her form gönderiminden önce aydınlatma metni onayı (`required` checkbox).

## SEO ve Schema

- Her iki site için `schema.org/Restaurant` markup zorunlu.
- Çalış için ek: `schema.org/ReservationAction`.
- Menü sayfaları: `schema.org/Menu` + `MenuItem`.
- Her sayfa için özgün `<title>`, `<meta description>`, `OpenGraph`.
- `sitemap.xml` her iki site için ayrı, build-time oluşturulur.

## Git Kuralları

- Branch: `feat/...`, `fix/...`, `chore/...`.
- Commit mesajı: **Conventional Commits** (`feat(calis): add reservation form`).
- Her PR: lint + typecheck + test yeşil olmalı.
- İki siteyi birlikte etkileyen değişiklikler `chore(shared): ...` veya `feat(shared): ...`.

## Kritik Hatırlatmalar

1. **İki siteyi karıştırma.** Çalış'a ait bir component veya metin, Fethiye Alkolsüz'e sızmamalı. Ortak olan `packages/ui`'daki nötr bileşenlerdir.
2. **Rezervasyon motoru sadece Çalış'ta.** Fethiye Alkolsüz uygulamasında `reservation-engine` paketine import yapma.
3. **Alkolsüz konsept hassas.** Fethiye Alkolsüz sitesinde "bar", "kokteyl", "şarap eşliği" gibi ifadeler **asla** geçmez; menüde veya hero metinde geçse bile derhal kaldır.
4. **Menü PDF olarak sunulmaz.** Her iki site için menü dinamik, CMS'ten gelir.
5. **Sunucu tarafı doğrulama zorunlu.** Client-side validation sadece UX içindir; API route'larda Zod ile doğrula.
6. **Görsel optimizasyon.** Her zaman `next/image`. Hero videosu 1.5MB'yi geçmemeli.
7. **WhatsApp link formatı:** her zaman `wa.me/90...` (uluslararası), metin URL-encode'lu.

## Referans Dokümanlar

- `docs/plan.md` — tam strateji, sitemap, rezervasyon akışı, MVP listesi.
- `apps/calis-balikcisi/CLAUDE.md` — Çalış'a özgü kurallar.
- `apps/fethiye-alkolsuz/CLAUDE.md` — Fethiye Alkolsüz'e özgü kurallar.

## Git Komutları
- Git komutlarını her zaman en kısa şekilde ver. Tek satırda `git add -A && git commit -m '...' && git push`. Uzun multi-line komut yazma. Dosya yollarını tek tek listeleme.
- Birden fazla commit gerekirse de toplam tek satıra sıkıştır.

## Aktif Skill'ler
Aşağıdaki skill'leri ilgili task'larda oku ve uygula:
- UI/UX: ~/.claude/skills/ui-ux-pro-max/SKILL.md
- Mobil: ~/.claude/skills/mobile-design/SKILL.md
- Frontend: ~/.claude/skills/frontend-design/SKILL.md
- Senior Frontend: ~/.claude/skills/senior-frontend/SKILL.md
- SEO: ~/.claude/skills/seo-optimizer/SKILL.md
- React: ~/.claude/skills/react-best-practices/SKILL.md
