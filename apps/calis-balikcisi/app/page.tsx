import { CalisHero } from './(sections)/hero';
import { Concept } from './(sections)/concept';
import { DailyHarvest } from './(sections)/daily-harvest';
import { MenuPreview } from './(sections)/menu-preview';
import { ReserveCta } from './(sections)/reserve-cta';
import { SiteFooter } from './(sections)/footer';

export default function HomePage() {
  return (
    <>
      <main>
        <CalisHero />
        <Concept />
        <DailyHarvest />
        <MenuPreview />
        <ReserveCta />
      </main>
      <SiteFooter />
    </>
  );
}
