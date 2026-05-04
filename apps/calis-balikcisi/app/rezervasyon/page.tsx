import type { Metadata } from 'next';
import { Inter_Tight, Spectral } from 'next/font/google';
import styles from './_styles/reservation.module.css';
import { ReservationShell } from './_components/reservation-shell';

const spectral = Spectral({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-spectral',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter-tight',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rezervasyon — Çalış Balıkçısı',
  description: 'Sahil kenarında bir akşam için masa seçin.',
};

export default function RezervasyonPage() {
  return (
    <div
      data-rezervasyon
      className={`${styles.reservationRoot} ${spectral.variable} ${interTight.variable}`}
    >
      <ReservationShell />
    </div>
  );
}
