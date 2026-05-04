'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../_styles/reservation.module.css';
import { VenueMap } from './venue-map';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function useReducedMotion(): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return matches;
}

export function ReservationShell() {
  const [headerHidden, setHeaderHidden] = useState(false);
  const [autoSelectKey, setAutoSelectKey] = useState(0);
  const reducedMotion = useReducedMotion();

  return (
    <>
      <motion.div
        animate={{
          opacity: headerHidden ? 0 : 1,
          height: headerHidden ? 0 : 'auto',
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.3,
          ease: 'easeOut',
        }}
        style={{ overflow: 'hidden' }}
        aria-hidden={headerHidden}
      >
        <div className={styles.brandRow}>
          <Link href="/" className={styles.brand}>
            Çalış Balıkçısı
          </Link>
          <span className={styles.label}>Rezervasyon</span>
        </div>

        <section className={styles.intro}>
          <h1>
            Hangi masada{' '}
            <span className={styles.italic}>yemek istersiniz?</span>
          </h1>
          <p className={styles.subline}>
            Masanızı seçin, akşamın keyfini çıkarın.
          </p>
          <button
            type="button"
            className={styles.heroCta}
            onClick={() => setAutoSelectKey((k) => k + 1)}
          >
            Sizin için masa seçeyim →
          </button>
        </section>
      </motion.div>

      <VenueMap
        onHeaderHiddenChange={setHeaderHidden}
        autoSelectKey={autoSelectKey}
      />
    </>
  );
}
