import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import '@balik/design-tokens/calis-balikcisi.css';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Çalış Balıkçısı',
  description: 'Çalış sahilinde, günün taze balığı ve gün batımı manzarası.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
