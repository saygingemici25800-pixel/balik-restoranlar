import { CalisHero } from './(sections)/hero';
import { Concept } from './(sections)/concept';
import { Principles } from './(sections)/principles';
import { DailyHarvest } from './(sections)/daily-harvest';
import { TeamSlider } from './(sections)/team-slider';
import { MenuPreview } from './(sections)/menu-preview';
import { ReserveCta } from './(sections)/reserve-cta';
import { SiteFooter } from './(sections)/footer';

export default function HomePage() {
  return (
    <>
      <main>
        <CalisHero />
        <Concept />
        <Principles />
        <DailyHarvest />
        <TeamSlider />
        <MenuPreview />
        <ReserveCta />
      </main>
      <SiteFooter />
    </>
  );
}
