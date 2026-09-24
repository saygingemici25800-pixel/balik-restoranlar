import type { Metadata } from 'next';
import { getMenuSections } from '@/lib/content/menu';
import { MenuContent } from './_components/menu-content';

// Statik üretilir; panel kaydı revalidateTag('menu') ile anında tazeler.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Sofra — Çalış Balıkçısı',
  description:
    "Çalış Balıkçısı'nın günlük taze balık menüsü. Levrek lokum, jumbo karides, kalamar ızgara ve mevsimsel mezeler. Fethiye'nin sahil restoranında Akdeniz sofrası.",
  alternates: {
    canonical: 'https://calis-balikcisi.vercel.app/menu',
  },
};

export default async function MenuPage() {
  const sections = await getMenuSections();

  return (
    <>
      <main>
        <MenuContent sections={sections} />
      </main>
    </>
  );
}
