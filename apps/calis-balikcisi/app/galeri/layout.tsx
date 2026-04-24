import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Galeri — Çalış Balıkçısı',
  description:
    'Tabaklardan mekâna, ekipten atmosfere — Çalış Balıkçısı deneyiminin görsel hikâyesi.',
};

export default function GaleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
