import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rezervasyon — Çalış Balıkçısı',
  description: 'Sahil kenarında bir akşam için masa ayırtın.',
};

export default function RezervasyonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
