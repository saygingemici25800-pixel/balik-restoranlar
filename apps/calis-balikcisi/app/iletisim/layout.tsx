import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim — Çalış Balıkçısı',
  description:
    'Bize ulaşın — Çalış Plajı, Fethiye. Telefon, email, adres ve açılış saatleri.',
};

export default function IletisimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
