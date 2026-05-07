import { CalisHero } from './(sections)/hero';
import { Concept } from './(sections)/concept';
import { ContactSummary } from './(sections)/contact-summary';
import { Principles } from './(sections)/principles';
import { DailyHarvest } from './(sections)/daily-harvest';
import { Ekibimiz } from './(sections)/ekibimiz';
import { MenuPreview } from './(sections)/menu-preview';
import { Testimonials } from './(sections)/testimonials';
import { ReserveCta } from './(sections)/reserve-cta';
import { Footer } from './_components/footer';
import { KardesTab } from './_components/kardes-tab';
import { MenuIntroAnimation } from './_components/menu-intro-animation';

export default function HomePage() {
  return (
    <div data-page="home">
      <MenuIntroAnimation />
      <main>
        <CalisHero />
        <Concept />
        <Principles />
        <MenuPreview />
        <DailyHarvest />
        <Ekibimiz />
        <Testimonials />
        <ReserveCta />
        <ContactSummary />
      </main>
      <KardesTab />
      <Footer />
    </div>
  );
}
