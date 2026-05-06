import type { Metadata } from 'next';
import { MenuContent } from './_components/menu-content';

export const metadata: Metadata = {
  title: 'Menü — Çalış Balıkçısı',
  description:
    'Çalış sahilinde mezelerden mangala, tatlılara — günün tezgâhından seçilmiş özel menü.',
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
