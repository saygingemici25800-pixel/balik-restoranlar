import { ReserveCta } from './(sections)/reserve-cta';
import { Contact } from './_home/contact';
import { Guests } from './_home/guests';
import { Hero } from './_home/hero';
import { HomeShell } from './_home/home-shell';
import { Journal } from './_home/journal';
import { MenuFeature } from './_home/menu-feature';
import { Place } from './_home/place';
import { SisterBand } from './_home/sister-band';
import { Story } from './_home/story';
import { Team } from './_home/team';

/**
 * Ana sayfa "Ufuk": iki zemin (Gece / Kum) dönüşümlü, her bölüm başında güneşli ufuk çizgisi.
 * Hero'da Zone'dan çekilmiş gün batımı filmi; menünün ayrı hero'su; sade hareket (CSS + tek
 * gözlemci). Rezervasyon kapalı (`ReserveCta` boş döner).
 */
export default function HomePage() {
  return (
    <HomeShell>
      <main>
        <Hero />
        <MenuFeature />
        <Story />
        <Place />
        <Team />
        <Guests />
        <ReserveCta />
        <Journal />
        <Contact />
        <SisterBand />
      </main>
    </HomeShell>
  );
}
