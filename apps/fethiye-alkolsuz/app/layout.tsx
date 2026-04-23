import type { Metadata } from 'next';
import '@balik/design-tokens/fethiye-alkolsuz.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fethiye Alkolsüz Balık Restaurant',
  description:
    "Fethiye'de ailece gönül rahatlığıyla balık yiyebileceğiniz, alkol servisi yapılmayan huzurlu bir mekân.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
