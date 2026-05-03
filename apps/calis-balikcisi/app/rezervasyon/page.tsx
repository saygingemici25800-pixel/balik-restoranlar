import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter_Tight, Spectral } from 'next/font/google';
import styles from './_styles/reservation.module.css';
import { VenueMap } from './_components/venue-map';

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
      <Link href="/" className={styles.brand}>
        Çalış Balıkçısı
        <small>Fethiye · Çalış sahili</small>
      </Link>

      <section className={styles.intro}>
        <span className={styles.label}>Rezervasyon</span>
        <h1>
          Hangi masada <span className={styles.italic}>yemek istersiniz?</span>
        </h1>
        <p className={styles.subline}>
          Masanızı seçin, kalanını biz hallederiz.
        </p>
        <a href="#" className={styles.altLink}>
          Acelen varsa klasik formla rezervasyon yap →
        </a>
      </section>

      <VenueMap />
    </div>
  );
}
