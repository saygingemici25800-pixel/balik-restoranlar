import type { Metadata } from 'next';
import { MenuContent } from './_components/menu-content';

export const metadata: Metadata = {
  title: 'Sofra — Çalış Balıkçısı',
  description:
    "Çalış Balıkçısı'nın günlük taze balık menüsü. Levrek lokum, jumbo karides, kalamar ızgara ve mevsimsel mezeler. Fethiye'nin sahil restoranında Akdeniz sofrası.",
  alternates: {
    canonical: 'https://calis-balikcisi.vercel.app/menu',
  },
};

export default function MenuPage() {
  return (
    <>
      <main>
        <MenuContent />
      </main>
    </>
  );
}
