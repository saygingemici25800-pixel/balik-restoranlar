import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  DM_Mono,
  Fraunces,
  Inter,
  Newsreader,
} from 'next/font/google';
import '@balik/design-tokens/calis-balikcisi.css';
import './globals.css';
import { LenisProvider } from './_components/lenis-provider';
import { ScrollProgress } from './_components/scroll-progress';

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
  title: 'Çalış Balıkçısı',
  description: 'Çalış sahilinde, günün taze balığı ve gün batımı manzarası.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${displayFont.variable} ${bodyFont.variable} ${frauncesFont.variable} ${dmMonoFont.variable} ${newsreaderFont.variable}`}
    >
      <body>
        <LenisProvider>
          <ScrollProgress />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
