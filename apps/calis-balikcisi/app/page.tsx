import { CalisHero } from './(sections)/hero';
import { Concept } from './(sections)/concept';
import { Atmosfer } from './(sections)/atmosfer';
import { ContactSummary } from './(sections)/contact-summary';
import { Instagram } from './(sections)/instagram';
import { Ekibimiz } from './(sections)/ekibimiz';
import { MenuPreview } from './(sections)/menu-preview';
import { Testimonials } from './(sections)/testimonials';
import { ReserveCta } from './(sections)/reserve-cta';
import { KardesTab } from './_components/kardes-tab';
import { MenuIntroAnimation } from './_components/menu-intro-animation';

export default function HomePage() {
  return (
    <>
      <MenuIntroAnimation />
      <main>
        <CalisHero />
        <Concept />
        <Atmosfer />
        <MenuPreview />
        <Instagram />
        <Ekibimiz />
        <Testimonials />
        <ReserveCta />
        <ContactSummary />
      </main>
      <KardesTab />
    </>
  );
}
