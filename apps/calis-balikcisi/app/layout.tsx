import type { Metadata } from 'next';
import '@balik/design-tokens/calis-balikcisi.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Çalış Balıkçısı',
  description: 'Çalış sahilinde, günün taze balığı ve gün batımı manzarası.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
