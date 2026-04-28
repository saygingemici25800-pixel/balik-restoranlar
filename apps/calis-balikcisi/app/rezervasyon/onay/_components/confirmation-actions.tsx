'use client';

import Link from 'next/link';
import { buildICS, type ConfirmationState } from '../_lib/format';

type Props = {
  state: ConfirmationState;
};

export function ConfirmationActions({ state }: Props) {
  function handleDownload() {
    const ics = buildICS(state);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservation-${state.code}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleDownload}
        className="max-w-xs w-full border border-accent text-accent py-3 px-6 text-xs md:text-sm uppercase tracking-wider hover:bg-accent hover:text-bg transition-colors"
      >
        Add to Calendar
      </button>
      <Link
        href="/"
        className="text-xs uppercase tracking-widest text-fg/60 hover:text-fg transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
