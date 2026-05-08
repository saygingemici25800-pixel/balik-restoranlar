import type { Metadata } from 'next';
import { SiteTopBar } from '../(sections)/top-bar';
import { ContactForm } from './_components/contact-form';
import { ContactHero } from './_components/contact-hero';
import { ContactInfo } from './_components/contact-info';

export const metadata: Metadata = {
  title: 'İletişim — Çalış Balıkçısı',
  description:
    'Çalış Balıkçısı ile iletişime geçin. Adres: Foça Mahallesi, Çalış Sahili, Fethiye. Telefon ve e-posta ile ulaşın.',
  alternates: {
    canonical: 'https://calis-balikcisi.vercel.app/iletisim',
  },
};

export default function IletisimPage() {
  return (
    <main>
      <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />
      <ContactHero />
      <ContactInfo />
      <ContactForm />
    </main>
  );
}
