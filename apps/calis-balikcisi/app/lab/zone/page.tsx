import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ZoneStage } from './zone-stage';

export const metadata: Metadata = {
  title: 'Zone Lab',
  robots: { index: false, follow: false },
};

/**
 * Zone geliştirme sahnesi — production'da 404 (docs/zone-3d-modul.md bölüm 2).
 * Perde site chrome'unun (footer, kaydırma göstergesi) üstünü tam ekran örter.
 */
export default function ZoneLabPage() {
  // production'da 404; yalnız film çekimi için derlenen build'de (NEXT_PUBLIC_ZONE_LAB=1) açık
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ZONE_LAB !== '1') notFound();

  return (
    <main className="fixed inset-0 z-[100] bg-bg">
      <ZoneStage />
    </main>
  );
}
