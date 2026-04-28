import { SiteFooter } from '../(sections)/footer';
import { SiteTopBar } from '../(sections)/top-bar';
import { ContactForm } from './_components/contact-form';
import { ContactHero } from './_components/contact-hero';
import { ContactInfo } from './_components/contact-info';

export default function IletisimPage() {
  return (
    <>
      <main>
        <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />
        <ContactHero />
        <ContactInfo />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
