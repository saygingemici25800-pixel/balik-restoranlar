'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { SiteTopBar } from '../../(sections)/top-bar';
import { SiteFooter } from '../../(sections)/footer';
import { ConfirmationCard } from './_components/confirmation-card';
import { ConfirmationActions } from './_components/confirmation-actions';
import {
  formatDate,
  generateCode,
  isReservationData,
  parseTableLabel,
  type ConfirmationState,
} from './_lib/format';

const STORAGE_KEY = 'reservationData';

export default function RezervasyonOnayPage() {
  const router = useRouter();
  const [state, setState] = useState<ConfirmationState | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace('/rezervasyon');
      return;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isReservationData(parsed) || !parsed.tableId) {
        router.replace('/rezervasyon');
        return;
      }

      setState({
        formattedDate: formatDate(parsed.date),
        time: parsed.time,
        guests: parsed.guests,
        tableLabel: parseTableLabel(parsed.tableId),
        code: generateCode(),
        rawDate: parsed.date,
      });
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      router.replace('/rezervasyon');
    }
  }, [router]);

  if (!state) {
    return (
      <main className="min-h-screen" aria-hidden="true">
        <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />
      </main>
    );
  }

  return (
    <>
      <main>
        <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />
        <section className="min-h-screen flex items-center justify-center">
          <div className="max-w-2xl mx-auto w-full px-6 py-24 flex flex-col items-center">
            <div
              className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-8"
              aria-hidden="true"
            >
              <Check className="h-6 w-6 text-bg" />
            </div>

            <h1 className="font-display text-4xl md:text-6xl text-fg text-center mb-4">
              Reservation Confirmed
            </h1>
            <p className="text-base text-fg/70 text-center mb-16">
              We look forward to welcoming you to the coast.
            </p>

            <ConfirmationCard state={state} />
            <ConfirmationActions state={state} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
