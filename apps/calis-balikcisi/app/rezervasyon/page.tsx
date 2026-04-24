import { SiteTopBar } from '../(sections)/top-bar';
import { SiteFooter } from '../(sections)/footer';
import { ReservationForm } from './_components/reservation-form';

export default function RezervasyonPage() {
  return (
    <>
      <main>
        <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />
        <div className="grid md:grid-cols-2 min-h-screen">
          <div
            className="hidden md:block md:min-h-screen bg-fg/5"
            aria-hidden="true"
          />
          <div className="px-6 pt-20 pb-16 md:p-16 lg:p-24 md:pt-32">
            <ReservationForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
