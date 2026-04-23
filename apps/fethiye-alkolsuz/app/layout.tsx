import type { Metadata } from 'next';
import { DM_Serif_Display, Inter } from 'next/font/google';
import '@balik/design-tokens/fethiye-alkolsuz.css';
import './globals.css';

const displayFont = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400'],
  display: 'swap',
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fethiye Alkolsüz Balık Restaurant',
  description:
    "Fethiye'de ailece gönül rahatlığıyla balık yiyebileceğiniz, alkol servisi yapılmayan huzurlu bir mekân.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
