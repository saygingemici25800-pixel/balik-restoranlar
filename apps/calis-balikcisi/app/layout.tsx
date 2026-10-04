import type { Metadata, Viewport } from 'next';
import '@balik/design-tokens/calis-balikcisi.css';
import './globals.css';
import { Footer } from './_components/footer';
import { SiteChrome } from './_components/site-chrome';
import { bodyFont, displayFont, dmMonoFont, frauncesFont, newsreaderFont } from '@/lib/fonts';

const SITE = 'https://calisbalikcisi.com';
/** Paylaşım kartı: cephe ve neon tabela, akşam (1200×630, gerçek mekân fotoğrafı). */
const SHARE_IMAGE = '/images/og-calis.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Çalış Balıkçısı — Fethiye Sahilinde Taze Deniz Ürünleri',
  description:
    "Çalış sahilinde 1999'dan beri Akif Usta'nın elinden taze deniz ürünleri. Gün batımı manzarası, mevsimsel mezeler ve rezervasyon kolaylığı ile Fethiye'nin köklü balık restoranı.",
  alternates: {
    canonical: 'https://calisbalikcisi.com',
  },
  openGraph: {
    title: 'Çalış Balıkçısı — Fethiye',
    description: "Çalış sahilinde 1999'dan beri. Mezattan masaya, az müdahaleyle.",
    url: 'https://calisbalikcisi.com',
    siteName: 'Çalış Balıkçısı',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Çalış Balıkçısı — akşam, Çalış sahilindeki cephe ve neon tabela',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Çalış Balıkçısı — Fethiye',
    description: "Çalış sahilinde 1999'dan beri. Mezattan masaya, az müdahaleyle.",
    images: [SHARE_IMAGE],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${displayFont.variable} ${bodyFont.variable} ${frauncesFont.variable} ${dmMonoFont.variable} ${newsreaderFont.variable}`}
    >
      <body>
        {/* Yapısal veri sunucu HTML'inde: JS çalıştırmayan tarayıcılar da görür (next/script
            afterInteractive bunu yalnız hidrasyondan sonra ekliyordu). */}
        <script
          id="schema-restaurant"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              name: 'Çalış Balıkçısı',
              description:
                "Çalış sahilinde 1999'dan beri Akif Usta'nın elinden taze deniz ürünleri. Gün batımı manzarası, mevsimsel mezeler.",
              url: 'https://calisbalikcisi.com',
              telephone: ['+902526220990', '+905326510848'],
              email: 'info@calisbalikcisi.com',
              foundingDate: '1999',
              servesCuisine: ['Türk Mutfağı', 'Akdeniz Mutfağı', 'Deniz Ürünleri'],
              priceRange: '₺₺₺',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Foça Mahallesi, 1054. Sokak No:66, Çalış Sahili',
                addressLocality: 'Fethiye',
                addressRegion: 'Muğla',
                postalCode: '48300',
                addressCountry: 'TR',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 36.6630325,
                longitude: 29.1082134,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ],
                  opens: '12:30',
                  closes: '01:30',
                },
              ],
              hasMap:
                'https://www.google.com/maps/place/Çalış+Balıkçısı/@36.6630367,29.1033425,17z',
              image: `${SITE}${SHARE_IMAGE}`,
              sameAs: [
                'https://www.instagram.com/calisbalikcisi/',
                'https://www.facebook.com/calisbalikcisi',
              ],
            }),
          }}
        />
        <SiteChrome footer={<Footer />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
