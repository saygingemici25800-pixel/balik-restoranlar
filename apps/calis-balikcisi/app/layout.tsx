import type { Metadata, Viewport } from 'next';
import {
  Cormorant_Garamond,
  DM_Mono,
  Fraunces,
  Inter,
  Newsreader,
} from 'next/font/google';
import Script from 'next/script';
import '@balik/design-tokens/calis-balikcisi.css';
import './globals.css';
import { Footer } from './_components/footer';
import { LenisProvider } from './_components/lenis-provider';
import { ScrollProgress } from './_components/scroll-progress';
import { ScrollToTop } from './_components/scroll-to-top';

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const frauncesFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmMonoFont = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
});

const newsreaderFont = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Çalış Balıkçısı — Fethiye Sahilinde Taze Deniz Ürünleri',
  description:
    "Çalış sahilinde 1999'den beri Akif Usta'nın elinden taze deniz ürünleri. Gün batımı manzarası, mevsimsel mezeler ve rezervasyon kolaylığı ile Fethiye'nin köklü balık restoranı.",
  alternates: {
    canonical: 'https://calis-balikcisi.vercel.app',
  },
  openGraph: {
    title: 'Çalış Balıkçısı — Fethiye',
    description:
      "Çalış sahilinde 1999'den beri. Mezattan masaya, az müdahaleyle.",
    url: 'https://calis-balikcisi.vercel.app',
    siteName: 'Çalış Balıkçısı',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/images/tezgah-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Çalış Balıkçısı — Fethiye sahilinde taze deniz ürünleri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Çalış Balıkçısı — Fethiye',
    description:
      "Çalış sahilinde 1999'den beri. Mezattan masaya, az müdahaleyle.",
    images: ['/images/tezgah-1.jpg'],
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
      <Script
        id="schema-restaurant"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: 'Çalış Balıkçısı',
            description:
              "Çalış sahilinde 1999'den beri Akif Usta'nın elinden taze deniz ürünleri. Gün batımı manzarası, mevsimsel mezeler.",
            url: 'https://calis-balikcisi.vercel.app',
            telephone: '+902526140000',
            email: 'info@calisbalikcisi.com',
            foundingDate: '1999',
            servesCuisine: [
              'Türk Mutfağı',
              'Akdeniz Mutfağı',
              'Deniz Ürünleri',
            ],
            priceRange: '₺₺₺',
            address: {
              '@type': 'PostalAddress',
              streetAddress:
                'Foça Mahallesi, 1054. Sokak No:66, Çalış Sahili',
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
                opens: '12:00',
                closes: '23:00',
              },
            ],
            hasMap:
              'https://www.google.com/maps/place/Çalış+Balıkçısı/@36.6630367,29.1033425,17z',
            image:
              'https://calis-balikcisi.vercel.app/images/tezgah-1.jpg',
            sameAs: [
              'https://www.instagram.com/calisbalikcisi/',
              'https://www.facebook.com/calisbalikcisi',
            ],
          }),
        }}
      />
      <body>
        <LenisProvider>
          <ScrollProgress />
          {children}
          <Footer />
          <ScrollToTop />
        </LenisProvider>
      </body>
    </html>
  );
}
