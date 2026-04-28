import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rezervasyon Onaylandı — Çalış Balıkçısı',
  description: 'Rezervasyonunuz başarıyla oluşturuldu.',
};

export default function RezervasyonOnayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
